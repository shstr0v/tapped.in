from dataclasses import dataclass


@dataclass(frozen=True)
class MailchimpSubscribeDTO:
    list_id: str
    email: str
    status: str = "subscribed"
    first_name: str | None = None
    last_name: str | None = None


@dataclass(frozen=True)
class MailchimpTokenDTO:
    access_token: str
    expires_in: int | None = None
