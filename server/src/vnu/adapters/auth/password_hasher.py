from argon2 import PasswordHasher as ArgonPasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHash

from vnu.application.common.auth.hasher import Hasher


class PasswordHasherImpl(Hasher):
    def __init__(self, argon_hasher: ArgonPasswordHasher) -> None:
        self.argon_hasher = argon_hasher
        
    def hash(self, raw: str) -> str:
        hash = self.argon_hasher.hash(raw)
        
        return hash

    def compare(self, raw: str, hash: str) -> bool:
        try:    
            self.argon_hasher.verify(hash, raw)
        except VerifyMismatchError:
            return False
        except InvalidHash:
            return False
        else:
            return True
