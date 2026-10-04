from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from vnu.adapters.data.models import UserModel
from vnu.application.common.user.dao import UserDAO
from vnu.application.dto.user import OnboardingStatusEnum, UserAccountDTO, UserDTO
from vnu.application.errors.user import UserNotFoundError
from vnu.domain.entities.user.enum import UserGenderEnum, UserStatusEnum


class UserDAOImpl(UserDAO):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _account_to_dto(self, user: UserModel) -> UserAccountDTO | None:
        gender = UserGenderEnum(user.gender) if user.gender else None
        if all(
            value is None
            for value in (user.username, user.first_name, user.last_name, user.age, gender, user.avatar_url)
        ):
            return None

        return UserAccountDTO(
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            age=user.age,
            gender=gender,
            avatar_url=user.avatar_url,
        )

    def _to_dto(
        self,
        user: UserModel,
        onboarding_status: OnboardingStatusEnum = OnboardingStatusEnum.REQUIRED,
    ) -> UserDTO:
        return UserDTO(
            id=user.id,
            account=self._account_to_dto(user),
            email=user.email,
            phone=user.phone,
            created_at=user.created_at,
            status=UserStatusEnum(user.status),
            onboarding_status=onboarding_status,
        )

    async def get_by_id(self, user_id: UUID | None = None, telegram_id: int | None = None) -> UserDTO | None:
        query = select(UserModel)
        if user_id is not None:
            query = query.where(UserModel.id == user_id)
        if telegram_id is not None:
            query = query.where(UserModel.telegram_id == telegram_id)

        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return self._to_dto(user) if user else None

    async def get_by_email(self, email: str, is_active: bool | None = True) -> UserDTO:
        query = select(UserModel).where(UserModel.email == email)
        if is_active is not None:
            status = UserStatusEnum.ACTIVE.value if is_active else UserStatusEnum.GUEST.value
            query = query.where(UserModel.status == status)

        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        if user is None:
            raise UserNotFoundError("User not found")
        return self._to_dto(user, self._onboarding_status(user))

    async def get_by_phone(self, phone: str, is_active: bool | None = True) -> UserDTO | None:
        query = select(UserModel).where(UserModel.phone == phone)
        if is_active is not None:
            status = UserStatusEnum.ACTIVE.value if is_active else UserStatusEnum.GUEST.value
            query = query.where(UserModel.status == status)

        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return self._to_dto(user, self._onboarding_status(user)) if user else None

    async def get_by_username(self, username: str) -> UserDTO:
        result = await self.session.execute(
            select(UserModel).where(
                UserModel.username == username,
                UserModel.status == UserStatusEnum.ACTIVE.value,
            )
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise UserNotFoundError("User not found")
        return self._to_dto(user, self._onboarding_status(user))

    async def events_attended_count(self, username: str, limit: int, offset: int) -> int:
        return 0

    async def update_email(self, user_id: UUID, email: str) -> None:
        query = update(UserModel).where(UserModel.id == user_id).values(email=email)
        await self.session.execute(query)

    async def add_telegram(self, user_id: UUID, telegram_id: int, telegram_username: str) -> None:
        query = (
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(telegram_id=telegram_id, username=telegram_username)
        )
        await self.session.execute(query)

    async def change_account_owner(self, user_id: UUID, new_user_id: UUID) -> None:
        return None

    async def add_location(self, user_id: UUID, country: str, city: str) -> None:
        return None

    async def complete_onboarding(
        self,
        user_id: UUID,
        avatar_url: str | None,
        username: str,
        first_name: str,
        last_name: str | None,
        gender: UserGenderEnum,
        age: int,
    ) -> None:
        query = (
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(
                avatar_url=avatar_url,
                username=username,
                first_name=first_name,
                last_name=last_name,
                gender=gender.value,
                age=age,
            )
        )
        await self.session.execute(query)

    def _onboarding_status(self, user: UserModel) -> OnboardingStatusEnum:
        is_complete = all((user.first_name, user.age, user.gender))
        return OnboardingStatusEnum.COMPLETED if is_complete else OnboardingStatusEnum.REQUIRED
