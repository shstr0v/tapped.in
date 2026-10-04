from uuid import UUID
from dataclasses import dataclass
from typing import Self
import random

from vnu.domain.common.value_object import ValueObject
from vnu.domain.exceptions.auth import (
    InvalidVerificationCodeError,
    InvalidRawPasscodeError,
)


VERIFICATION_CODE_LENGTH = 4


@dataclass(frozen=True)
class PasscodeId(ValueObject[UUID]):
    value: UUID


@dataclass(frozen=True)
class Passcode(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        has_invalid_length = len(self.value) != VERIFICATION_CODE_LENGTH

        if has_invalid_length:
            raise InvalidVerificationCodeError()

    @classmethod
    def generate_code(cls) -> Self:
        code = "".join(random.choices("0123456789", k=VERIFICATION_CODE_LENGTH))

        return cls(code)


@dataclass(frozen=True)
class RawPasscode(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        has_invalid_length = len(self.value) != VERIFICATION_CODE_LENGTH

        if has_invalid_length:
            raise InvalidRawPasscodeError()


@dataclass(frozen=True)
class PinId(ValueObject[str]):
    value: str
