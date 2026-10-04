import re
import uuid
from abc import ABC
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Generic, TypeVar
from uuid import UUID

from vnu.domain.exceptions.common import InvalidUrlError

V = TypeVar("V", bound=Any)


class BaseValueObject(ABC):
    def __post_init__(self) -> None:
        self._validate()

    def _validate(self) -> None:
        ...


@dataclass(frozen=True)
class ValueObject(BaseValueObject, Generic[V], ABC):
    value: V

    def __eq__(self, other: object) -> bool:
        if isinstance(other, self.__class__):
            return self.value == other.value
        return NotImplemented

    def __str__(self) -> str:
        return f"{self.value}"

    def __repr__(self) -> str:
        class_name = type(self).__name__
        return f"{class_name}(value={self.value})"

    def __ne__(self, other: object) -> bool:
        return not (self == other)

    def __hash__(self) -> int:
        return hash(self.value)

    def __bytes__(self) -> bytes:
        return self.__str__().encode()

    def to_string(self) -> str:
        return str(self.value)

    def raw(self) -> V:
        return self.value


@dataclass(frozen=True)
class ComplexValueObject(BaseValueObject, ABC):
    pass


@dataclass(frozen=True)
class Money(ComplexValueObject, ABC):
    amount: Decimal
    currency: str


class URL(ValueObject[str], ABC):
    value: str
    
    def _validate(self) -> None:
        pattern = re.compile(
            r'^(https?:\/\/)?'
            r'(www\.)?'
            r'([a-zA-Z0-9_-]+\.)+'
            r'[a-zA-Z]{2,}'
            r'(:\d+)?'
            r'(\/[^\s]*)?$',
            re.IGNORECASE
        )

        if not re.match(pattern, self.value):
            raise InvalidUrlError


@dataclass(frozen=True)
class Timestamp(ValueObject[datetime]):
    value: datetime


@dataclass(frozen=True)
class UID(ValueObject[UUID]):
    value: UUID
