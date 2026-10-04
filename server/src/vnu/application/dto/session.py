from dataclasses import dataclass, field
from uuid import UUID


@dataclass(frozen=True)
class SessionDTO:
    user_id: UUID
    session: str
    abs_exp: int
    idle_exp: int
    created_at: int
    last_seen: int
    ua_hash: str
    rotated_from: str | None = field(default=None)


@dataclass(frozen=True)
class CreateSessionDTO:
    user_id: UUID
    user_agent: str


@dataclass(frozen=True)
class GetSessionDTO:
    session_id: str


@dataclass(frozen=True)
class DeleteSessionDTO:
    session_id: str
    user_id: UUID


@dataclass(frozen=True)
class GetAllUserSessionsDTO:
    user_id: UUID


@dataclass(frozen=True)
class TerminateAllUserSessionsDTO:
    user_id: UUID


@dataclass(frozen=True)
class RefreshSessionDTO:
    session_id: str
    user_agent: str


@dataclass(frozen=True)
class CompareUserAgentDTO:
    ua_hash: str
    user_agent: str


@dataclass(frozen=True)
class ValidateSessionDTO:
    session_id: str
    user_agent: str
