from fastapi import APIRouter, status
from dishka.integrations.fastapi import FromDishka, inject
from pydantic import BaseModel

from vnu.application.commands.user import CreateGuestCommand, CreateGuestCommandDTO
from vnu.application.dto.user import GetUserWithUsernameDTO, UpdateUserDTO
from vnu.application.interactors.user import CompleteUser, GetByUsername, UpdateUser
from vnu.application.interactors.user.complete import CompleteUserDTO
from vnu.application.queries.user import GetMe
from vnu.domain.entities.user.enum import UserGenderEnum

router = APIRouter(prefix="/users", tags=["users"])


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


@router.post("/guest", status_code=status.HTTP_201_CREATED)
@inject
async def create_guest(
    data: CreateGuestRequest,
    command: FromDishka[CreateGuestCommand],
):
    return await command(CreateGuestCommandDTO(email=data.email))


@router.get("/me")
@inject
async def get_me(query: FromDishka[GetMe]):
    return await query()


@router.patch("/me")
@inject
async def update_me(
    data: UpdateUserRequest,
    interactor: FromDishka[UpdateUser],
):
    return await interactor(
        UpdateUserDTO(
            username=data.username,
            first_name=data.first_name,
            gender=data.gender,
            last_name=data.last_name,
            avatar_url=data.avatar_url,
        )
    )


@router.post("/me/complete")
@inject
async def complete_me(
    data: CompleteUserRequest,
    interactor: FromDishka[CompleteUser],
):
    return await interactor(
        CompleteUserDTO(
            username=data.username,
            avatar_url=data.avatar_url,
            first_name=data.first_name,
            last_name=data.last_name,
            gender=data.gender,
            age=data.age,
        )
    )


@router.get("/by-username/{username}")
@inject
async def get_by_username(
    username: str,
    interactor: FromDishka[GetByUsername],
):
    return await interactor(GetUserWithUsernameDTO(username=username))
