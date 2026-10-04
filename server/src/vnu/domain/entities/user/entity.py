import uuid
from datetime import datetime, UTC

from vnu.domain.common.entity import Entity
from vnu.domain.entities.user.value_objects import (
    UserId,
    Username,
    EmailAddress,
    CreatedAt, 
    UserFullname,
    PhoneNumber,
    AvatarUrl,
    UserAge,
    HashedPassword,
    TelegramId,
    TelegramUsername,
)
from vnu.domain.entities.user.enum import UserStatusEnum, UserGenderEnum


class User(Entity):
    __slots__ = (
        "id",
        "telegram_id",
        "telegram_username",
        "username",
        "email",
        "fullname",
        "created_at",
        "status",
        "hashed_password",
        "avatar_url",
        "phone",
        "age",
        "gender",
    )

    def __init__(
        self,
        id: UserId,
        telegram_id: TelegramId | None,
        username: Username | None,
        created_at: CreatedAt,
        status: UserStatusEnum,
        telegram_username: TelegramUsername | None,
        fullname: UserFullname | None,
        age: UserAge | None,
        gender: UserGenderEnum | None,
        hashed_password: HashedPassword | None,
        email: EmailAddress | None = None,
        phone: PhoneNumber | None = None,
        avatar_url: AvatarUrl | None = None,
    ) -> None:
        self.id = id
        self.telegram_id = telegram_id
        self.telegram_username = telegram_username
        self.username = username
        self.email = email
        self.phone = phone
        self.created_at = created_at
        self.status = status
        self.fullname = fullname
        self.avatar_url = avatar_url
        self.age = age
        self.gender = gender
        self.hashed_password = hashed_password

    @classmethod
    def create(
        cls,
        status: UserStatusEnum | None = None,
        email: EmailAddress | None = None,
        phone: PhoneNumber | None = None,
        fullname: UserFullname | None = None,
        age: UserAge | None = None,
        gender: UserGenderEnum | None = None,
        hashed_password: HashedPassword | None = None,
        telegram_id: TelegramId | None = None,
        telegram_username: TelegramUsername | None = None,
        username: Username | None = None,
        avatar_url: AvatarUrl | None = None,   
    ) -> "User":
        user_id = uuid.uuid4()
        now = datetime.now(UTC)

        if username is None:
            if telegram_username:
                username = Username(telegram_username.value)
            elif email:
                username = Username(email.username)

        return cls(
            id=UserId(user_id),
            telegram_id=telegram_id,
            telegram_username=telegram_username,
            email=email,
            phone=phone,
            created_at=CreatedAt(now),
            username=username,
            status=status if status else UserStatusEnum.GUEST,
            fullname=fullname or UserFullname(),
            age=age,
            gender=gender,
            hashed_password=hashed_password,
            avatar_url=avatar_url,
        )

    def update(
        self,
        fullname: UserFullname,
        email: EmailAddress | None = None,
        age: UserAge | None = None,
        gender: UserGenderEnum | None = None,
        avatar_url: AvatarUrl | None = None,
        username: Username | None = None,
    ) -> None:
        self.email = email
        self.fullname = fullname
        self.age = age
        self.gender = gender
        self.avatar_url = avatar_url
        self.username = username

    def activate(self) -> None:
        self.status = UserStatusEnum.ACTIVE
