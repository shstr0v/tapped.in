import hmac
from hashlib import sha256

from vnu.application.common.auth.hasher import Hasher


class SHA256Hasher(Hasher):
    def hash(self, raw: str) -> str:
        return sha256(raw.encode()).hexdigest()

    def compare(self, raw: str, hash: str) -> bool:
        return hmac.compare_digest(self.hash(raw), hash)
