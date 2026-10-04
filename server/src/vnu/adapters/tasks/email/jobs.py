from dishka import FromDishka
from dishka.integrations.taskiq import inject

from vnu.application.common.otp.service import OtpService
from vnu.application.dto.otp import SendOtpDTO


@inject
async def send_otp(data: SendOtpDTO, otp_service: FromDishka[OtpService]) -> None:
    await otp_service.send(data)
