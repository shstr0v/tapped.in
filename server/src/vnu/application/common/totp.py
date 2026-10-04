from abc import abstractmethod
from typing import Protocol


class TOTPGenerator(Protocol):
    @abstractmethod
    def generate(self) -> str:
        raise NotImplementedError


class TOTPValidator(Protocol):
    @abstractmethod
    def validate(self, secret: str, hash: str, interval: int = 30, digits: int = 6) -> bool:
        raise NotImplementedError
