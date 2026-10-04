from typing import Protocol
from abc import abstractmethod

from vnu.application.dto.otp import SendOtpDTO, OtpDTO, CheckOtpDTO


class OtpService(Protocol):
    @abstractmethod
    async def send(self, data: SendOtpDTO) -> OtpDTO:
        raise NotImplementedError

    @abstractmethod
    async def check(self, data: CheckOtpDTO) -> OtpDTO:
        raise NotImplementedError
