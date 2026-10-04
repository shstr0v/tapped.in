from vnu.application.common.user.service import UserService
from vnu.application.common.user.dao import UserDAO
from vnu.application.common.user.repository import UserRepository
from vnu.application.dto.user import (
    CreateUserDTO,
    CheckIfUserExistsByEmailDTO,
    UserDTO,
    UserActivateDTO,
    UserAccountDTO,
)
from vnu.domain.entities.user.value_objects import (
    EmailAddress,
    UserId,
    PhoneNumber,
    AvatarUrl,
    UserFullname,
    Username,
    UserAge,
    HashedPassword,
    TelegramId,
    TelegramUsername,
)
from vnu.domain.entities.user.entity import User
from vnu.application.errors.user import UserNotFoundError
from vnu.application.common.auth.hasher import Hasher


class UserServiceImpl(UserService):
    def __init__(
        self,
        query: UserDAO,
        repository: UserRepository,
        password_hasher: Hasher,
    ) -> None:
        self.dao = query
        self.repository = repository
        self.password_hasher = password_hasher

    async def create_user(self, data: CreateUserDTO) -> UserDTO:
        if data.raw_password:
            hashed_password = self.password_hasher.hash(data.raw_password)
            hashed_password = HashedPassword(hashed_password)
        else:
            hashed_password = None
        user_entity = User.create(
            telegram_id=TelegramId(data.telegram_id) if data.telegram_id else None,
            telegram_username=TelegramUsername(data.telegram_username) if data.telegram_username else None,
            email=EmailAddress(data.email) if data.email else None,
            username=Username(data.username) if data.username else None,
            phone=PhoneNumber.create(data.phone) if data.phone else None,
            fullname=UserFullname(data.first_name, data.last_name) if data.first_name or data.last_name else None,
            avatar_url=AvatarUrl(data.avatar_url) if data.avatar_url else None,
            status=data.status,
            age=UserAge(data.age) if data.age else None,
            gender=data.gender,
            hashed_password=hashed_password,
        )
        user = await self.repository.create(user=user_entity)

        return UserDTO(
            id=user.id.raw(),
            created_at=user.created_at.raw(),
            phone=user.phone.value if user.phone else None,
            email=user.email.raw() if user.email else None,
            status=user.status,
            account=UserAccountDTO(
                username=user.username.raw() if user.username else None,
                first_name=user.fullname.first_name if user.fullname else None,
                last_name=user.fullname.last_name if user.fullname else None,
                age=user.age.value if user.age else None,
                gender=user.gender,
                avatar_url=user.avatar_url.raw() if user.avatar_url else None,
            ),
        )

    async def check_user_exists_by_email(
        self, data: CheckIfUserExistsByEmailDTO
    ) -> bool:
        try:
            await self.dao.get_by_email(email=data.email, is_active=True)
            return True
        except UserNotFoundError:
            return False

    async def activate_user(self, data: UserActivateDTO) -> UserDTO:
        user = await self.repository.get_user(UserId(data.user_id))
        if user is None:
            raise UserNotFoundError("User not found.")

        user.activate()
        user = await self.repository.update(user)

        return UserDTO(
            id=user.id.raw(),
            created_at=user.created_at.raw(),
            phone=user.phone.value if user.phone else None,
            email=user.email.raw() if user.email else None,
            status=user.status,
            account=UserAccountDTO(
                username=user.username.raw() if user.username else None,
                first_name=user.fullname.first_name if user.fullname else None,
                last_name=user.fullname.last_name if user.fullname else None,
                age=user.age.value if user.age else None,
                gender=user.gender,
                avatar_url=user.avatar_url.raw() if user.avatar_url else None,
            ),
        )
