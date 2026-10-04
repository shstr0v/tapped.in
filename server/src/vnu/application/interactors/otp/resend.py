from vnu.application.common.interactor import Interactor
from vnu.application.common.uow import UoW
from vnu.application.common.otp.service import OtpService
from vnu.application.common.user.dao import UserDAO
from vnu.application.dto.otp import SendOtpDTO, OtpDTO
from vnu.adapters.auth.idp import SessionIdProvider


class ResendOtp(Interactor[None, OtpDTO]):
    def __init__(
        self,
        uow: UoW,
        otp_service: OtpService,
        user_query: UserDAO,
        idp: SessionIdProvider,
    ) -> None:
        self.uow = uow
        self.otp_service = otp_service
        self.user_query = user_query
        self.idp = idp

    async def __call__(self) -> OtpDTO:
        user_id = await self.idp.get_current_id()
        user = await self.user_query.get_by_id(user_id.raw())
        otp = await self.otp_service.send(
            SendOtpDTO(
                user_id=user.id,
                email=user.email,
            )
        )
        await self.uow.commit()

        return otp
