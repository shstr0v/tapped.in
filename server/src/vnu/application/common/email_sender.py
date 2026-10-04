from abc import abstractmethod
from typing import Protocol

from vnu.application.dto.email import EmailMessageDTO


class EmailSender(Protocol):
    @abstractmethod
    async def send(self, data: EmailMessageDTO) -> None:
        raise NotImplementedError
