from abc import abstractmethod
from typing import Protocol

from vnu.domain.entities.user.entity import User
from vnu.domain.entities.user.value_objects import UserId, EmailAddress, PhoneNumber, TelegramId


class UserRepository(Protocol):
    @abstractmethod
    async def get_user(
        self,
        user_id: UserId | None = None,
        telegram_id: TelegramId | None = None,
        email: EmailAddress | None = None,
        phone: PhoneNumber | None = None,
    ) -> User | None:
        raise NotImplementedError

    @abstractmethod
    async def get_user_by_email(self, email: EmailAddress) -> User | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, user: User) -> User:
        raise NotImplementedError

    @abstractmethod
    async def update(self, user: User) -> User:
        raise NotImplementedError

    @abstractmethod
    async def get_user_by_phone(self, phone: PhoneNumber) -> User | None:
        raise NotImplementedError