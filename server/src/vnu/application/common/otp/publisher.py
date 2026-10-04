from abc import abstractmethod
from typing import Protocol

from vnu.application.dto.otp import SendOtpDTO


class OtpPublisher(Protocol):
    @abstractmethod
    async def publish(self, data: SendOtpDTO) -> None:
        raise NotImplementedError
