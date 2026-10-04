from abc import abstractmethod
from typing import Any, Protocol, TypeVar, Generic

ID = TypeVar("ID", bound=Any, covariant=True)


class IdProvider(Protocol, Generic[ID]):
    @abstractmethod
    def get_current_id(self) -> ID:
        raise NotImplementedError
