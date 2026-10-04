from abc import abstractmethod
from typing import Protocol

from vnu.application.dto.mailchimp import MailchimpSubscribeDTO, MailchimpTokenDTO


class MailchimpClient(Protocol):
    @abstractmethod
    async def subscribe(self, data: MailchimpSubscribeDTO) -> None:
        raise NotImplementedError


class MailchimpOauthClient(Protocol):
    @abstractmethod
    async def exchange_code(self, code: str, redirect_uri: str) -> MailchimpTokenDTO:
        raise NotImplementedError


class MailchimpMarketingClient(Protocol):
    @abstractmethod
    async def ping(self, access_token: str, server_prefix: str) -> dict:
        raise NotImplementedError
