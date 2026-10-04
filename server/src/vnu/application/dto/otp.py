from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class SendOtpDTO:
    user_id: UUID
    phone: str


@dataclass(frozen=True)
class OtpDTO:
    id: UUID
    user_id: UUID
    code: str
    phone: str


@dataclass(frozen=True)
class CheckOtpDTO:
    user_id: UUID
    code: str
