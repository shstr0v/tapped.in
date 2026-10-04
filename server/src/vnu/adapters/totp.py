import base64
import os
import hmac
import hashlib
import struct
import time
import base64

from vnu.application.common.totp import TOTPGenerator, TOTPValidator


class TOTPGeneratorImpl(TOTPGenerator):
    def generate(self) -> str:
        return base64.urlsafe_b64encode(os.urandom(20)).decode("utf-8")


class TOTPValidatorImpl(TOTPValidator):
    def validate(self, secret: str, hash: str, interval: int = 30, digits: int = 6) -> bool:
        try:
            key = base64.urlsafe_b64decode(secret + "=" * (-len(secret) % 4))
        except ValueError:
            return False

        for offset in [-1, 0, 1]:
            counter = int(time.time() // interval) + offset
            msg = struct.pack(">Q", counter)
            hm = hmac.new(key, msg, hashlib.sha1).digest()
            o = hm[19] & 0xf
            code = (struct.unpack(">I", hm[o:o+4])[0] & 0x7fffffff) % (10 ** digits)
            if hash == str(code).zfill(digits):
                return True

        return False
