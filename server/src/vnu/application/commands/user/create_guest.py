from dataclasses import dataclass

from vnu.domain.entities.user.value_objects import EmailAddress
from vnu.domain.entities.user.entity import User
from vnu.application.common.command import Command
from vnu.application.common.user.repository import UserRepository
from vnu.application.dto.user import UserDTO, UserAccountDTO


@dataclass(frozen=True)
class CreateGuestCommandDTO:
    email: str | None = None


class CreateGuestCommand(Command[CreateGuestCommandDTO, UserDTO]):
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    async def __call__(self, data: CreateGuestCommandDTO) -> UserDTO:
        user = User.create(
            email=EmailAddress(data.email) if data.email else None,
        )
        user = await self.user_repository.create(user)

        return UserDTO(
            id=user.id.raw(),
            phone=user.phone.value if user.phone else None,
            email=user.email.raw() if user.email else None,
            created_at=user.created_at.raw(),
            status=user.status,
            account=UserAccountDTO(
                username=user.username.raw() if user.username else None,
                first_name=user.fullname.first_name if user.fullname else None,
                last_name=user.fullname.last_name if user.fullname else None,
                age=user.age.value if user.age else None,
                gender=user.gender,
                avatar_url=user.avatar_url.raw() if user.avatar_url else None,
            ) if user.fullname else None,
        )
