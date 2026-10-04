from dataclasses import dataclass


@dataclass(frozen=True)
class EmailMessageDTO:
    to: str
    subject: str
    body: str
    html: str | None = None
