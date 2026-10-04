import re
from uuid import UUID
from dataclasses import dataclass

from vnu.domain.common.value_object import ValueObject, Timestamp, ComplexValueObject, URL
from vnu.domain.exceptions.user import (
    InvalidUsernameError,
    WeakPasswordError,
    InvalidEmailAddressError, InvalidUserFullnameError,
    InvalidPhoneNumberError,
    InvalidUserAgeError,
)


MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 50
MAX_FULLNAME_LENGTH = 50
MIN_FULLNAME_LENGTH = 0
MAX_PHONE_NUMBER_LENGTH = 15
MIN_AGE = 1
MAX_AGE = 100


@dataclass(frozen=True)
class UserId(ValueObject[UUID]):
    value: UUID


@dataclass(frozen=True)
class Username(ValueObject[str]):
    value: str
    
    def _validate(self) -> None:
        starts_with_digit = self.value[0].isdigit()
        has_invalid_length = len(self.value) < MIN_USERNAME_LENGTH or len(self.value) > MAX_USERNAME_LENGTH

        if has_invalid_length:
            raise InvalidUsernameError("Invalid username length.")
        if starts_with_digit:
            raise InvalidUsernameError("Username can not start with a digit.")


@dataclass(frozen=True)
class CreatedAt(Timestamp):
    ...


@dataclass(frozen=True)
class RawPassword(ValueObject[str]):
    value: str
    
    def _validate(self) -> None:
        has_digits = any(char.isdigit() for char in self.value)
        has_appropiate_length = len(self.value) >= 8
        has_special_symbols = any(not char.isalnum() for char in self.value)
        has_uppercases = any(char.isupper() for char in self.value)

        if not all([has_appropiate_length, has_digits, has_special_symbols, has_uppercases]):
            raise WeakPasswordError("Password is weak.")


@dataclass(frozen=True)
class HashedPassword(ValueObject[str]):
    value: str


@dataclass(frozen=True)
class EmailAddress(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        email_template = (
            r"^[a-z0-9!#$%&'*+/=?^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~\-]+)*"
            r"@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$"
        )

        if not re.match(email_template, self.value):
            raise InvalidEmailAddressError("Email address is invalid.")

    @property
    def username(self) -> str:
        email = self.value.split("@")

        return email[0]


@dataclass(frozen=True)
class UserFullname(ComplexValueObject):
    first_name: str | None = None
    last_name: str | None = None

    def _validate(self) -> None:
        if self.first_name and (len(self.first_name) > MAX_FULLNAME_LENGTH or len(self.first_name) < MIN_FULLNAME_LENGTH):
            raise InvalidUserFullnameError("Invalid fullname length.")
        if self.last_name and (len(self.last_name) > MAX_FULLNAME_LENGTH or len(self.last_name) < MIN_FULLNAME_LENGTH):
            raise InvalidUserFullnameError("Invalid last name length.")


@dataclass(frozen=True)
class PhoneNumber(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if len(self.value) > MAX_PHONE_NUMBER_LENGTH:
            raise InvalidPhoneNumberError("Invalid phone number length.")
        if not self.value[1:].isdigit():
            raise InvalidPhoneNumberError("Phone number must contain only digits.")

    @classmethod
    def create(cls, value: str) -> "PhoneNumber":
        if not value.startswith("+"):
            value = "+" + value

        return cls(value)


@dataclass(frozen=True)
class AvatarUrl(URL):
    ...


@dataclass(frozen=True)
class UserAge(ValueObject[int]):
    value: int

    def _validate(self) -> None:
        if self.value < MIN_AGE or self.value > MAX_AGE:
            raise InvalidUserAgeError("Invalid user age.")

    @property
    def is_adult(self) -> bool:
        return self.value >= 18


@dataclass(frozen=True)
class TelegramId(ValueObject[int]):
    value: int


@dataclass(frozen=True)
class TelegramUsername(ValueObject[str]):
    value: str
