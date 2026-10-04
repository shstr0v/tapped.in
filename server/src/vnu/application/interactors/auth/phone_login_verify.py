from vnu.application.common.interactor import Interactor
from vnu.application.common.user.repository import UserRepository
from vnu.application.dto.auth import PhoneLoginVerifyDTO, PhoneLoginVerifyResponseDTO
from vnu.application.dto.user import UserDTO
from vnu.application.dto.otp import CheckOtpDTO
from vnu.domain.entities.user.value_objects import PhoneNumber
from vnu.application.common.otp.service import OtpService
from vnu.application.common.auth.session import SessionService
from vnu.application.dto.session import CreateSessionDTO
from vnu.application.common.user.dao import UserDAO
from vnu.application.errors.user import UserNotFoundError


class PhoneLoginVerify(Interactor[PhoneLoginVerifyDTO, PhoneLoginVerifyResponseDTO]):
    def __init__(
        self,
        otp_service: OtpService,
        repository: UserRepository,
        session_service: SessionService,
        dao: UserDAO,
    ) -> None:
        self.repository = repository
        self.otp_service = otp_service
        self.session_service = session_service
        self.dao = dao

    async def __call__(self, data: PhoneLoginVerifyDTO) -> PhoneLoginVerifyResponseDTO:
        user = await self.repository.get_user_by_phone(phone=PhoneNumber.create(data.phone))
        if user is None:
            raise UserNotFoundError("User not found")
        await self.otp_service.check(CheckOtpDTO(
            user_id=user.id.raw(),
            code=data.code,
        ))
        session = await self.session_service.create(CreateSessionDTO(
            user_id=user.id.raw(),
            user_agent=data.user_agent
        ))

        user = await self.dao.get_by_id(user_id=user.id.raw())
        return PhoneLoginVerifyResponseDTO(
            user=user,
            sid=session.session,
        )
