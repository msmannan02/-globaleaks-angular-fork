# -*- coding: utf-8 -*-
#
# Handlers exposing customization files
import os
import urllib

from twisted.internet.defer import inlineCallbacks

from globaleaks.handlers.admin.file import get_file_id_by_name
from globaleaks.handlers.base import BaseHandler
from globaleaks.utils.fs import directory_traversal_check


appfiles = {
    'favicon': 'favicon.ico',
    'logo': 'logo.png',
    'css': 'custom.css',
}

class FileHandler(BaseHandler):
    """
    Handler that provide public access to configuration files
    """
    check_roles = 'any'

    allowed_mimetypes = [
        'audio/mpeg',
        'font/ttf',
        'font/woff',
        'font/woff2',
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/x-icon',
        'text/css',
        'video/mp4'
    ]

    # Note: This set of mime types intentionally differs from the mime
    #       types accepted by the admin handler.
    #       For example it intentionally do not include application/pdf
    #       to ensure file download is enforced on PDF files.

    @inlineCallbacks
    def get(self, name):
        name = urllib.parse.unquote(name)

        id = yield get_file_id_by_name(self.request.tid, name)
        if not id:
            id = yield get_file_id_by_name(1, name)

        path = os.path.abspath(os.path.join(self.state.settings.files_path, id))
        directory_traversal_check(self.state.settings.files_path, path)

        if name in appfiles:
            name = appfiles[name]

        yield self.write_file(name, path)
