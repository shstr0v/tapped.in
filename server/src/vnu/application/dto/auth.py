from dataclasses import dataclass

from vnu.application.dto.user import UserDTO


@dataclass(frozen=True)
class PhoneLoginDTO:
    phone: str
    

@dataclass(frozen=True)
class PhoneLoginResponseDTO:
    user: UserDTO


@dataclass(frozen=True)
class PhoneLoginVerifyDTO:
    phone: str
    code: str
    user_agent: str


@dataclass(frozen=True)
class PhoneLoginVerifyResponseDTO:
    user: UserDTO
    sid: str


@dataclass(frozen=True)
class EmailLoginDTO:
    email: str
    raw_password: str
    user_agent: str


@dataclass(frozen=True)
class EmailLoginResponseDTO:
    user: UserDTO
    sid: str
