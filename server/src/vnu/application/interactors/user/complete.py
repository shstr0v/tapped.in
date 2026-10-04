import uuid
from dataclasses import dataclass

from vnu.application.common.interactor import Interactor
from vnu.application.dto.user import UserDTO, OnboardingStatusEnum
from vnu.application.errors.user import UserNotFoundError, UserAlreadyCompletedOnboarding
from vnu.application.common.user.repository import UserRepository
from vnu.application.common.user.dao import UserDAO
from vnu.application.common.uow import UoW
from vnu.adapters.auth.idp import SessionIdProvider
from vnu.domain.entities.user.enum import UserGenderEnum


@dataclass(frozen=True)
class CompleteUserDTO:
    username: str
    avatar_url: str | None
    first_name: str
    last_name: str | None
    gender: UserGenderEnum
    age: int


class CompleteUser(Interactor[CompleteUserDTO, UserDTO]):
    def __init__(
        self,
        user_dao: UserDAO,
        uow: UoW,
        idp: SessionIdProvider,
    ) -> None:
        self.user_dao = user_dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: CompleteUserDTO) -> UserDTO:
        user_id = await self.idp.get_current_id()
        user = await self.user_dao.get_by_id(user_id=user_id.raw())
        if user is None:
            raise UserNotFoundError("User not found.")

        if user.onboarding_status == OnboardingStatusEnum.COMPLETED:
            raise UserAlreadyCompletedOnboarding("User already completed onboarding.")

        await self.user_dao.complete_onboarding(
            user_id=user_id.raw(),
            avatar_url=data.avatar_url,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            gender=data.gender,
            age=data.age,
        )
        await self.uow.commit()

        return await self.user_dao.get_by_id(user_id=user_id.raw())
    
