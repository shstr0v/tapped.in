from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from vnu.application.dto.user import UserDTO
from vnu.domain.entities.user.enum import UserGenderEnum


class UserDAO(Protocol):
    @abstractmethod
    async def get_by_id(self, user_id: UUID | None = None, telegram_id: int | None = None) -> UserDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_email(self, email: str, is_active: bool | None = None) -> UserDTO:
        raise NotImplementedError

    @abstractmethod
    async def get_by_phone(self, phone: str, is_active: bool | None = None) -> UserDTO:
        raise NotImplementedError

    @abstractmethod
    async def get_by_username(self, username: str) -> UserDTO:
        raise NotImplementedError

    @abstractmethod
    async def events_attended_count(self, username: str, limit: int, offset: int) -> int:
        raise NotImplementedError
    
    @abstractmethod
    async def update_email(self, user_id: UUID, email: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def add_telegram(self, user_id: UUID, telegram_id: int, telegram_username: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def change_account_owner(self, user_id: UUID, new_user_id: UUID) -> None:
        raise NotImplementedError

    @abstractmethod
    async def add_location(self, user_id: UUID, country: str, city: str) -> None:
        raise NotImplementedError

    @abstractmethod
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
        raise NotImplementedError
