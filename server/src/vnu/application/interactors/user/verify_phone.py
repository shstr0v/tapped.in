from vnu.application.common.interactor import Interactor
from vnu.application.dto.user import VerifyPhoneDTO, UserDTO, UserActivateDTO
from vnu.application.dto.otp import CheckOtpDTO
from vnu.application.common.user.service import UserService
from vnu.application.services.otp import OtpService
from vnu.application.common.uow import UoW
from vnu.adapters.auth.idp import SessionIdProvider


class VerifyPhone(Interactor[VerifyPhoneDTO, UserDTO]):
    def __init__(
        self,
        user_service: UserService,
        otp_service: OtpService,
        idp: SessionIdProvider,
        uow: UoW,
    ) -> None:
        self.user_service = user_service
        self.otp_service = otp_service
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: VerifyPhoneDTO) -> UserDTO:
        user_id = await self.idp.get_current_id()
        await self.otp_service.check(
            CheckOtpDTO(
                user_id=user_id.raw(),
                code=data.code,
            )
        )
        user = await self.user_service.activate_user(
            UserActivateDTO(
                user_id=user_id.raw(),
            )
        )
        await self.uow.commit()

        return user
