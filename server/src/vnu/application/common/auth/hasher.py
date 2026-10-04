from typing import Protocol
from abc import abstractmethod


class Hasher(Protocol):
    @abstractmethod
    def hash(self, raw: str) -> bytes:
        raise NotImplementedError

    @abstractmethod
    def compare(self, raw: str, hash: bytes) -> bool:
        raise NotImplementedError
