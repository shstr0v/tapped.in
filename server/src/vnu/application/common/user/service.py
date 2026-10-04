from abc import abstractmethod
from typing import Protocol

from vnu.application.dto.user import (
    CreateUserDTO,
    CheckIfUserExistsByEmailDTO,
    UserDTO,
    UserActivateDTO,
)


class UserService(Protocol):
    @abstractmethod
    async def create_user(self, data: CreateUserDTO) -> UserDTO:
        raise NotImplementedError

    @abstractmethod
    async def check_user_exists_by_email(
        self, data: CheckIfUserExistsByEmailDTO
    ) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def activate_user(self, data: UserActivateDTO) -> UserDTO:
        raise NotImplementedError
