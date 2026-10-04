from typing import Protocol, NewType
from abc import abstractmethod

PhoneNumber = NewType("PhoneNumber", str)
PinId = NewType("PinId", str)

class SmsClient(Protocol):
    @abstractmethod
    async def send_otp(self, to: PhoneNumber, code: str) -> None:
        raise NotImplementedError
        