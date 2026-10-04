from vnu.application.common.interactor import Interactor
from vnu.application.common.uow import UoW
from vnu.application.common.otp.service import OtpService
from vnu.application.common.user.dao import UserDAO
from vnu.application.dto.otp import SendOtpDTO, OtpDTO


class SendOtp(Interactor[SendOtpDTO, OtpDTO]):
    def __init__(
        self,
        uow: UoW,
        otp_service: OtpService,
        user_query: UserDAO,
    ) -> None:
        self.uow = uow
        self.otp_service = otp_service
        self.user_query = user_query

    async def __call__(self, data: SendOtpDTO) -> OtpDTO:
        otp = await self.otp_service.send(data)
        await self.uow.commit()

        return otp
