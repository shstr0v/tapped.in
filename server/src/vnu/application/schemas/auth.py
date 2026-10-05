from pydantic import BaseModel

from vnu.domain.entities.user.enum import UserGenderEnum


class PhoneLoginRequest(BaseModel):
    phone: str


class PhoneLoginVerifyRequest(BaseModel):
    phone: str
    code: str


class EmailLoginRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    phone: str
    age: int
    gender: UserGenderEnum
    first_name: str
    last_name: str
    password: str
    telegram_id: int | None = None
    username: str | None = None
    avatar_url: str | None = None


class VerifyPhoneRequest(BaseModel):
    code: str
