from sqlalchemy import delete, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from vnu.adapters.data.models import UserModel
from vnu.application.common.user.repository import UserRepository
from vnu.application.errors.user import UserNotFoundError
from vnu.domain.entities.user.entity import User
from vnu.domain.entities.user.enum import UserGenderEnum, UserStatusEnum
from vnu.domain.entities.user.value_objects import (
    AvatarUrl,
    CreatedAt,
    EmailAddress,
    HashedPassword,
    PhoneNumber,
    TelegramId,
    TelegramUsername,
    UserAge,
    UserFullname,
    UserId,
    Username,
)


class UserRepositoryImpl(UserRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user: User) -> User:
        user_model = self._to_model(user)
        self.session.add(user_model)
        await self.session.flush(objects=[user_model])
        return user

    async def update(self, user: User) -> User:
        await self.session.merge(self._to_model(user))
        return user

    async def delete(self, user_id: UserId) -> None:
        query = delete(UserModel).where(UserModel.id == user_id.value)
        await self.session.execute(query)

    async def get_user(
        self,
        user_id: UserId | None = None,
        telegram_id: TelegramId | None = None,
        email: EmailAddress | None = None,
        phone: PhoneNumber | None = None,
    ) -> User | None:
        filters = []
        if user_id is not None:
            filters.append(UserModel.id == user_id.value)
        if telegram_id is not None:
            filters.append(UserModel.telegram_id == telegram_id.value)
        if email is not None:
            filters.append(UserModel.email == email.value)
        if phone is not None:
            filters.append(UserModel.phone == phone.value)

        result = await self.session.execute(select(UserModel).where(*filters))
        user_model = result.scalar_one_or_none()
        return self._to_entity(user_model) if user_model is not None else None

    async def get_user_by_email(self, email: EmailAddress) -> User:
        try:
            result = await self.session.execute(
                select(UserModel).where(
                    UserModel.email == email.value,
                    UserModel.status == UserStatusEnum.ACTIVE.value,
                )
            )
            user_model = result.scalar_one()
        except NoResultFound:
            raise UserNotFoundError("User not found") from None

        return self._to_entity(user_model)

    async def get_user_by_phone(self, phone: PhoneNumber, status: UserStatusEnum | None = None) -> User | None:
        query = select(UserModel).where(UserModel.phone == phone.value)
        if status is not None:
            query = query.where(UserModel.status == status.value)

        result = await self.session.execute(query)
        user_model = result.scalar_one_or_none()
        return self._to_entity(user_model) if user_model is not None else None

    def _to_model(self, user: User) -> UserModel:
        return UserModel(
            id=user.id.value,
            telegram_id=user.telegram_id.value if user.telegram_id else None,
            username=user.username.value if user.username else None,
            first_name=user.fullname.first_name if user.fullname else None,
            last_name=user.fullname.last_name if user.fullname else None,
            age=user.age.value if user.age else None,
            gender=user.gender.value if user.gender else None,
            avatar_url=user.avatar_url.value if user.avatar_url else None,
            email=user.email.value if user.email else None,
            hashed_password=user.hashed_password.value if user.hashed_password else None,
            phone=user.phone.value if user.phone else None,
            status=user.status.value,
            created_at=user.created_at.value,
        )

    def _to_entity(self, user_model: UserModel) -> User:
        return User(
            id=UserId(user_model.id),
            telegram_id=TelegramId(user_model.telegram_id) if user_model.telegram_id else None,
            telegram_username=TelegramUsername(user_model.username) if user_model.username else None,
            username=Username(user_model.username) if user_model.username else None,
            email=EmailAddress(user_model.email) if user_model.email else None,
            phone=PhoneNumber.create(user_model.phone) if user_model.phone else None,
            age=UserAge(user_model.age) if user_model.age else None,
            gender=UserGenderEnum(user_model.gender) if user_model.gender else None,
            created_at=CreatedAt(user_model.created_at),
            status=UserStatusEnum(user_model.status),
            hashed_password=HashedPassword(user_model.hashed_password) if user_model.hashed_password else None,
            avatar_url=AvatarUrl(user_model.avatar_url) if user_model.avatar_url else None,
            fullname=UserFullname(user_model.first_name, user_model.last_name),
        )
