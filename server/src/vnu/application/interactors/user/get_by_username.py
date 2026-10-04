from vnu.application.common.interactor import Interactor
from vnu.application.dto.user import UserDTO
from vnu.application.common.user.dao import UserDAO
from vnu.application.errors.user import UserNotFoundError
from vnu.application.dto.user import GetUserWithUsernameDTO


class GetByUsername(Interactor[GetUserWithUsernameDTO, UserDTO]):
    def __init__(
        self,
        query: UserDAO,
    ) -> None:
        self.dao = query

    async def __call__(self, data: GetUserWithUsernameDTO) -> UserDTO:
        user = await self.dao.get_by_username(data.username)
        if user is None:
            raise UserNotFoundError("User not found.")

        return user
