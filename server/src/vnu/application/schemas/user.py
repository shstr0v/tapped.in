from pydantic import BaseModel

from vnu.domain.entities.user.enum import UserGenderEnum


class CreateGuestRequest(BaseModel):
    email: str | None = None


class CompleteUserRequest(BaseModel):
    username: str
    avatar_url: str | None = None
    first_name: str
    last_name: str | None = None
    gender: UserGenderEnum
    age: int


class UpdateUserRequest(BaseModel):
    username: str
    first_name: str
    gender: UserGenderEnum
    last_name: str | None = None
    avatar_url: str | None = None
