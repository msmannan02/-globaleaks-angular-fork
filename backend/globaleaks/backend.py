# -*- coding: utf-8
#   backend
#   *******
import sys
import traceback

from twisted.application import service
from twisted.internet import reactor, defer
from twisted.python.log import ILogObserver
from twisted.web import resource, server

from globaleaks.jobs import job, jobs_list
from globaleaks.services import onion

from globaleaks.db import create_db, init_db, update_db, \
    sync_refresh_tenant_cache, sync_clean_untracked_files, sync_initialize_snimap
from globaleaks.rest.api import APIResourceWrapper
from globaleaks.settings import Settings
from globaleaks.state import State
from globaleaks.utils.log import log, openLogFile, logFormatter, LogObserver
from globaleaks.utils.sock import listen_tcp_on_sock, listen_tls_on_sock


# Set Gzip Encoder compression level to 1 prioritizing speed over compression
server.GzipEncoderFactory.compressLevel = 1


def fail_startup(excep):
    log.err("ERROR: Cannot start GlobaLeaks. Please manually examine the exception.")
    log.err("EXCEPTION: %s", excep)
    log.debug('TRACE: %s', traceback.format_exc(excep))
    if reactor.running:
        reactor.stop()


class Request(server.Request):
    log_ip_and_ua = False


class Site(server.Site):
    requestFactory = Request

    def _openLogFile(self, path):
        return openLogFile(path, Settings.log_file_size, Settings.num_log_files)


class Service(service.Service):
    _shutdown = False

    def __init__(self):
        self.state = State
        self.arw = resource.EncodingResourceWrapper(APIResourceWrapper(), [server.GzipEncoderFactory()])

        if Settings.nodaemon:
            self.api_factory = Site(self.arw, logFormatter=logFormatter)
        else:
            self.api_factory = Site(self.arw, logPath=Settings.accesslogfile, logFormatter=logFormatter)

        self.api_factory.displayTracebacks = False

    def startService(self):
        reactor.callLater(0, self.deferred_start)

    def shutdown(self):
        d = defer.Deferred()

        def _shutdown(_):
            if self._shutdown:
                return

            self._shutdown = True
            self.state.orm_tp.stop()
            d.callback(None)

        reactor.callLater(30, _shutdown, None)

        self.stop_jobs().addBoth(_shutdown)

        return d

    def start_jobs(self):
        for j in jobs_list:
            self.state.jobs.append(j())

        self.state.onion_service = onion.OnionService()
        self.state.services.append(self.state.onion_service)

        self.state.jobs_monitor = job.JobsMonitor(self.state.jobs)

    def stop_jobs(self):
        deferred_list = []

        for job in self.state.jobs + self.state.services:
            deferred_list.append(defer.maybeDeferred(job.stop))

        if self.state.jobs_monitor is not None:
            deferred_list.append(self.state.jobs_monitor.stop())
            self.state.jobs_monitor = None

        return defer.DeferredList(deferred_list)

    def _deferred_start(self):
        ret = update_db()

        if ret == -1:
            reactor.stop()
            return

        if ret == 0:
            create_db()
            init_db()

        sync_clean_untracked_files()
        sync_refresh_tenant_cache()
        sync_initialize_snimap()

        self.state.orm_tp.start()

        reactor.addSystemEventTrigger('before', 'shutdown', self.shutdown)

        for sock in self.state.http_socks:
            listen_tcp_on_sock(reactor, sock.fileno(), self.api_factory)

        for sock in self.state.https_socks:
            listen_tls_on_sock(reactor,
                               fd=sock.fileno(),
                               contextFactory=self.state.snimap,
                               factory=self.api_factory)

        self.start_jobs()

        self.print_listening_interfaces()

    @defer.inlineCallbacks
    def deferred_start(self):
        try:
            yield self._deferred_start()
        except Exception as excep:
            fail_startup(excep)

    def print_listening_interfaces(self):
        print("GlobaLeaks is now running and accessible at the following urls:")

        tenant_cache = self.state.tenants[1].cache

        if self.state.settings.devel_mode:
            print("- [HTTP]\t--> http://127.0.0.1:8082")

        elif tenant_cache.reachable_via_web:
            hostname = tenant_cache.hostname if tenant_cache.hostname else '0.0.0.0'
            print("- [HTTP]\t--> http://%s" % hostname)
            if tenant_cache.https_enabled:
                print("- [HTTPS]\t--> https://%s" % hostname)

        if tenant_cache.onionservice:
            print("- [Tor]:\t--> http://%s" % tenant_cache.onionservice)


try:
    application = service.Application('GlobaLeaks')

    if not Settings.nodaemon:
        logfile = openLogFile(Settings.logfile, Settings.log_file_size, Settings.num_log_files)
        application.setComponent(ILogObserver, LogObserver(logfile).emit)

    Service().setServiceParent(application)
except Exception as excep:
    fail_startup(excep)
    # Exit with non-zero exit code to signal systemd/systemV
    sys.exit(55)
