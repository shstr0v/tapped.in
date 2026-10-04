from dataclasses import dataclass
from uuid import UUID
from datetime import datetime

from vnu.application.common.query import Query
from vnu.domain.entities.user.enum import UserStatusEnum, UserGenderEnum
from vnu.application.common.user.dao import UserDAO
from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.errors.user import UserNotFoundError


@dataclass(frozen=True)
class UserReadModelDTO:
    id: UUID
    email: str | None
    phone: str | None
    created_at: datetime
    status: UserStatusEnum
    first_name: str | None
    last_name: str | None
    age: int | None
    username: str | None
    gender: UserGenderEnum | None
    avatar_url: str | None = None


class GetMe(Query[None, UserReadModelDTO]):
    def __init__(self, user_dao: UserDAO, idp: SessionIdProvider) -> None:
        self.user_dao = user_dao
        self.idp = idp

    async def __call__(self) -> UserReadModelDTO:
        user_id = await self.idp.get_current_id()
        user = await self.user_dao.get_by_id(user_id=user_id.value)
        if user is None:
            raise UserNotFoundError("User not found")
        account = user.account
        return UserReadModelDTO(
            id=user.id,
            email=user.email,
            phone=user.phone,
            created_at=user.created_at,
            status=user.status,
            first_name=account.first_name if account else None,
            last_name=account.last_name if account else None,
            age=account.age if account else None,
            username=account.username if account else None,
            gender=account.gender if account else None,
            avatar_url=account.avatar_url if account else None,
        )
