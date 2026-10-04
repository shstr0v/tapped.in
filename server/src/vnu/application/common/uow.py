from typing import Protocol
from abc import abstractmethod


class UoW(Protocol):
    @abstractmethod
    async def commit(self):
        raise NotImplementedError

    @abstractmethod
    async def rollback(self):
        raise NotImplementedError

    @abstractmethod
    async def flush(self):
        raise NotImplementedError
