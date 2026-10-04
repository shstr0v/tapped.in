from uuid import UUID
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from vnu.domain.entities.user.enum import UserStatusEnum, UserGenderEnum

class OnboardingStatusEnum(Enum):
    COMPLETED = "completed"
    REQUIRED = "required"


@dataclass(frozen=True)
class BankAccountDTO:
    stripe_account_id: str
    created_at: datetime
    

@dataclass
class UserAccountDTO:
    first_name: str | None = None
    last_name: str | None = None
    age: int | None = None
    username: str | None = None
    gender: UserGenderEnum | None = None
    avatar_url: str | None = None


@dataclass(frozen=True)
class UserDTO:
    id: UUID
    email: str | None
    phone: str | None
    created_at: datetime
    status: UserStatusEnum
    account: UserAccountDTO | None = None
    onboarding_status: OnboardingStatusEnum = OnboardingStatusEnum.REQUIRED


@dataclass(frozen=True)
class GetUserWithIdDTO:
    user_id: UUID


@dataclass(frozen=True)
class GetUserWithUsernameDTO:
    username: str


@dataclass(frozen=True)
class CreateUserDTO:
    email: str | None = None
    telegram_id: int | None = None
    telegram_username: str | None = None
    username: str | None = None
    phone: str | None = None
    age: int | None = None
    status: UserStatusEnum | None = None
    gender: UserGenderEnum | None = None
    first_name: str | None = None
    last_name: str | None = None
    raw_password: str | None = None
    avatar_url: str | None = None


@dataclass(frozen=True)
class SignUpDTO:
    email: str
    phone: str
    age: int
    user_agent: str
    gender: UserGenderEnum
    first_name: str
    raw_password: str
    last_name: str
    telegram_id: int | None = None
    username: str | None = None
    avatar_url: str | None = None


@dataclass(frozen=True)
class SignUpResponseDTO:
    sid: str
    user: UserDTO


@dataclass(frozen=True)
class CheckIfUserExistsByEmailDTO:
    email: str


@dataclass(frozen=True)
class UserActivateDTO:
    user_id: UUID


@dataclass(frozen=True)
class VerifyPhoneDTO:
    code: str


@dataclass(frozen=True)
class ActivateUserWithTokenCommandDTO:
    telegram_id: int
    token: str

@dataclass(frozen=True)
class UpdateUserDTO:
    username: str
    first_name: str
    gender: UserGenderEnum
    last_name: str | None = None
    avatar_url: str | None = None
