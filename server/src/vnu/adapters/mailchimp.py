from aiohttp import ClientResponseError, ClientSession

from vnu.application.common.mailchimp import MailchimpClient, MailchimpMarketingClient, MailchimpOauthClient
from vnu.application.dto.mailchimp import MailchimpSubscribeDTO, MailchimpTokenDTO
from vnu.application.errors.mailchimp import MailchimpRequestError


class MailchimpClientImpl(MailchimpClient):
    def __init__(self, api_key: str, client: ClientSession) -> None:
        self.api_key = api_key
        self.client = client

    async def subscribe(self, data: MailchimpSubscribeDTO) -> None:
        payload = {
            "email_address": data.email,
            "status": data.status,
            "merge_fields": {
                "FNAME": data.first_name or "",
                "LNAME": data.last_name or "",
            },
        }
        try:
            response = await self.client.post(
                f"/3.0/lists/{data.list_id}/members",
                auth=("anystring", self.api_key),
                json=payload,
            )
            response.raise_for_status()
        except ClientResponseError as exc:
            raise MailchimpRequestError("Mailchimp subscribe request failed.") from exc


class MailchimpOauthClientImpl(MailchimpOauthClient):
    def __init__(self, client: ClientSession, client_id: str, client_secret: str) -> None:
        self.client = client
        self.client_id = client_id
        self.client_secret = client_secret

    async def exchange_code(self, code: str, redirect_uri: str) -> MailchimpTokenDTO:
        try:
            response = await self.client.post(
                "/oauth2/token",
                data={
                    "grant_type": "authorization_code",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
            response.raise_for_status()
            payload = await response.json()
        except ClientResponseError as exc:
            raise MailchimpRequestError("Mailchimp OAuth request failed.") from exc

        return MailchimpTokenDTO(
            access_token=payload["access_token"],
            expires_in=payload.get("expires_in"),
        )


class MailchimpMarketingClientImpl(MailchimpMarketingClient):
    def __init__(self, client: ClientSession) -> None:
        self.client = client

    async def ping(self, access_token: str, server_prefix: str) -> dict:
        try:
            response = await self.client.get(
                f"https://{server_prefix}.api.mailchimp.com/3.0/ping",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return await response.json()
        except ClientResponseError as exc:
            raise MailchimpRequestError("Mailchimp marketing request failed.") from exc
