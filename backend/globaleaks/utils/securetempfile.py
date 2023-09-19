# -*- coding: utf-8 -*-
import os

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from globaleaks.utils.crypto import generateRandomKey

crypto_backend = default_backend()


class SecureTemporaryFile(object):
    def __init__(self, filesdir):
        """
        Create the AES Key to encrypt the uploaded file and initialize the cipher
        """
        self.fd = None
        self.key = os.urandom(32)
        self.key_id = generateRandomKey()
        self.key_counter_nonce = os.urandom(16)
        self.cipher = Cipher(algorithms.AES(self.key), modes.CTR(self.key_counter_nonce), backend=crypto_backend)
        self.filepath = os.path.join(filesdir, "%s.aes" % self.key_id)
        self.size = 0
        self.enc = self.cipher.encryptor()
        self.dec = None

    def open(self, mode):
        if mode == 'w':
            self.fd = open(self.filepath, 'ab+')
        else:
            self.fd = open(self.filepath, 'rb')
            self.dec = self.cipher.decryptor()

        return self

    def write(self, data):
        if isinstance(data, str):
            data = data.encode()

        self.fd.write(self.enc.update(data))
        self.size += len(data)

    def finalize_write(self):
        self.fd.write(self.enc.finalize())

    def read(self, c=None):
        if c is None:
            data = self.fd.read()
        else:
            data = self.fd.read(c)

        if data:
            return self.dec.update(data)

        return self.dec.finalize()

    def close(self):
        if self.fd is not None:
            self.fd.close()
            self.fd = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def __del__(self):
        self.close()

        try:
            os.remove(self.filepath)
        except:
            pass
