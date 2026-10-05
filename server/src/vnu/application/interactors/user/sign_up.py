import logging

from vnu.application.dto.user import (
    SignUpDTO,
    SignUpResponseDTO,
    CreateUserDTO,
    CheckIfUserExistsByEmailDTO,
)
from vnu.application.common.interactor import Interactor
from vnu.application.common.uow import UoW
from vnu.application.common.user.service import UserService
from vnu.application.errors.auth import UnauthorizedError
from vnu.application.common.otp.service import OtpService
from vnu.application.common.auth.session import SessionService
from vnu.application.dto.session import CreateSessionDTO
from vnu.application.dto.otp import SendOtpDTO
from vnu.application.errors.sms import SmsSendingError

logger = logging.getLogger(__name__)


class SignUp(Interactor[SignUpDTO, SignUpResponseDTO]):
    def __init__(
        self,
        uow: UoW,
        user_service: UserService,
        session_service: SessionService,
        otp_service: OtpService,
    ) -> None:
        self.uow = uow
        self.user_service = user_service
        self.session_service = session_service
        self.otp_service = otp_service

    async def __call__(self, data: SignUpDTO) -> SignUpResponseDTO:
        exists = await self.user_service.check_user_exists_by_email(
            CheckIfUserExistsByEmailDTO(email=data.email)
        )
        if exists:
            raise UnauthorizedError

        user = await self.user_service.create_user(
            CreateUserDTO(
                email=data.email,
                telegram_id=data.telegram_id,
                username=data.username,
                phone=data.phone,
                age=data.age,
                raw_password=data.raw_password,
                gender=data.gender,
                first_name=data.first_name,
                last_name=data.last_name,
                avatar_url=data.avatar_url,
            )
        )
        session = await self.session_service.create(CreateSessionDTO(user_id=user.id, user_agent=data.user_agent))
        try:
            await self.otp_service.send(SendOtpDTO(user_id=user.id, phone=data.phone))
        except SmsSendingError:
            logger.warning("Verification SMS was not delivered for user %s; sign up continues.", user.id)
        await self.uow.commit()

        return SignUpResponseDTO(sid=session.session, user=user)
