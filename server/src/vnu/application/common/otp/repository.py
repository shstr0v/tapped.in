from abc import abstractmethod
from typing import Protocol
from vnu.domain.entities.auth.entities import OneTimePasscode
from vnu.domain.entities.user.value_objects import UserId


class OtpRepository(Protocol):
    @abstractmethod
    async def create(self, otp: OneTimePasscode) -> OneTimePasscode:
        raise NotImplementedError

    @abstractmethod
    async def load_by_user_id(self, user_id: UserId) -> OneTimePasscode | None:
        raise NotImplementedError

    @abstractmethod
    async def update(self, otp: OneTimePasscode) -> OneTimePasscode:
        raise NotImplementedError
