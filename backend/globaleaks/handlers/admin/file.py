# -*- coding: utf-8 -*-
import mimetypes
import os
import re

from sqlalchemy.sql.expression import or_
from twisted.internet.defer import inlineCallbacks, returnValue

from globaleaks import models
from globaleaks.handlers.base import BaseHandler
from globaleaks.orm import transact, tw
from globaleaks.rest import errors, requests
from globaleaks.state import State
from globaleaks.utils.fs import directory_traversal_check
from globaleaks.utils.utility import uuid4


special_files = ['css', 'favicon', 'logo']


@transact
def get_files(session, tid):
    """
    Transaction to retrieve the list of files configured on a tenant

    :param session: An ORM session
    :param tid: The tenant ID on which perform the lookup
    :return: A list of descriptors of the configured files
    """
    ret = []

    for sf in session.query(models.File).filter(models.File.tid == tid):
        if sf.name in special_files or re.match(requests.uuid_regexp, sf.name):
            continue

        ret.append({
            'id': sf.id,
            'name': sf.name
        })

    return ret


def db_add_file(session, tid, file_id, name):
    """
    Transaction to register a file on a tenant

    :param session: An ORM session
    :param tid: The tenant ID
    :param file_id: The ID of the file to be added
    :param name: The file name
    """
    file_obj = models.File()
    file_obj.tid = tid
    file_obj.id = file_id
    file_obj.name = name
    session.merge(file_obj)


def db_get_file_by_id_or_name(session, tid, id_or_name):
    return session.query(models.File) \
                  .filter(models.File.tid == tid,
                          or_(models.File.id == id_or_name,
                              models.File.name == id_or_name)).one_or_none()


@transact
def get_file_id_by_name(session, tid, name):
    """
    Transaction returning a file ID given the file name

    :param session: An ORM session
    :param tid: A tenant on which performing the lookup
    :param name: A file name
    :return: A result model
    """
    file_obj = db_get_file_by_id_or_name(session, tid, name)
    return file_obj.id if file_obj else ''


@transact
def delete_file(session, tid, id_or_name):
    file_obj = db_get_file_by_id_or_name(session, tid, id_or_name)
    if not file_obj:
        return

    path = os.path.join(State.settings.files_path, file_obj.id)
    directory_traversal_check(State.settings.files_path, path)
    if os.path.exists(path):
        os.remove(path)

    return session.delete(file_obj)


class FileInstance(BaseHandler):
    check_roles = 'user'
    invalidate_cache = True
    upload_handler = True

    allowed_mimetypes = [
        'audio/mpeg',
        'application/pdf',
        'font/ttf',
        'font/woff',
        'font/woff2',
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/x-icon',
        'video/mp4'
    ]

    def permission_check(self):
        if self.session.user_role != 'admin' and \
          not self.session.has_permission('can_edit_general_settings'):
            raise errors.InvalidAuthentication

    @inlineCallbacks
    def post(self, name):
        self.permission_check()

        if name == 'css':
            self.allowed_mimetypes = ['text/css']
        elif name == 'favicon':
            self.allowed_mimetypes = ['image/vnd.microsoft.icon']
        elif name == 'logo' or re.match(requests.uuid_regexp, name):
            self.allowed_mimetypes = ['image/gif', 'image/jpeg', 'image/png']

        if self.uploaded_file['type'] not in self.allowed_mimetypes:
            raise errors.ForbiddenOperation

        if name in special_files or re.match(requests.uuid_regexp, name):
            self.uploaded_file['name'] = name

        id = uuid4()

        path = os.path.join(self.state.settings.files_path, id)

        if os.path.exists(path):
            return

        yield tw(db_add_file, self.request.tid, id, self.uploaded_file['name'])

        yield self.write_upload_plaintext_to_disk(path)

        returnValue(id)

    @inlineCallbacks
    def delete(self, name):
        self.permission_check()

        yield delete_file(self.request.tid, name)


class FileCollection(BaseHandler):
    check_roles = 'user'

    def permission_check(self):
        if self.session.user_role != 'admin' and \
          not self.session.has_permission('can_edit_general_settings'):
            raise errors.InvalidAuthentication

    def get(self):
        """
        Return the list of files and their info
        """
        self.permission_check()

        return get_files(self.request.tid)
