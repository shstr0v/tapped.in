from datetime import datetime, UTC
from uuid import UUID
import logging

from vnu.application.common.auth.session import SessionService, SessionDAO, SessionProcessor
from vnu.application.dto.session import (
    CreateSessionDTO,
    SessionDTO,
    GetSessionDTO,
    DeleteSessionDTO,
    TerminateAllUserSessionsDTO,
    RefreshSessionDTO,
    CompareUserAgentDTO,
    ValidateSessionDTO,
)
from vnu.adapters.auth.sha256_hasher import SHA256Hasher
from vnu.application.errors.auth import UnauthorizedError

ABSOLUTE_EXPIRATION_TIME = 60 * 60 * 24 * 60  # 60 days
IDLE_EXPIRATION_TIME = 60 * 60 * 24 * 30  # 30 days
FIVE_MINUTES = 60 * 5

logger = logging.getLogger(__name__)


class SessionServiceImpl(SessionService):
    def __init__(self, dao: SessionDAO, processor: SessionProcessor, hasher: SHA256Hasher) -> None:
        self.dao = dao
        self.processor = processor
        self.hasher = hasher
        
    async def create(self, data: CreateSessionDTO) -> SessionDTO:
        sid = self.processor.generate()
        now = datetime.now(UTC).timestamp()
        ua_hash = self.hasher.hash(data.user_agent)
        s = SessionDTO(
            user_id=data.user_id,
            session=sid,
            abs_exp=now + ABSOLUTE_EXPIRATION_TIME,
            idle_exp=now + IDLE_EXPIRATION_TIME,
            created_at=now,
            last_seen=now,
            ua_hash=ua_hash,
        )
        session = await self.dao.create(s, ttl=IDLE_EXPIRATION_TIME)

        return session

    async def get(self, data: GetSessionDTO) -> SessionDTO | None:
        return await self.dao.get(data)
    
    async def terminate(self, data: DeleteSessionDTO) -> None:
        await self.dao.delete(data)
        
    async def get_all(self, user_id: UUID) -> list[SessionDTO]:
        return await self.dao.get_all(user_id)
    
    async def terminate_all(self, data: TerminateAllUserSessionsDTO) -> None:
        await self.dao.delete_all(data.user_id)

    async def refresh(self, data: RefreshSessionDTO) -> SessionDTO:
        session = await self.dao.get(GetSessionDTO(session_id=data.session_id))
        now = datetime.now(UTC).timestamp()
        if session is None:
            raise UnauthorizedError()
        if session.abs_exp < now:
            raise UnauthorizedError()
        
        if now - session.last_seen < FIVE_MINUTES:
            return session

        last_seen = now
        new_idle_expires = min(now + IDLE_EXPIRATION_TIME, session.abs_exp)
        
        new_s = SessionDTO(
            user_id=session.user_id,
            session=session.session,
            abs_exp=ABSOLUTE_EXPIRATION_TIME,
            idle_exp=new_idle_expires,
            created_at=session.created_at,
            last_seen=last_seen,
            ua_hash=session.ua_hash,
            rotated_from=session.session,
        )
        await self.dao.update(new_s, ttl=max(1, new_s.idle_exp - now))

        return new_s

    async def compare_user_agent(self, data: CompareUserAgentDTO) -> bool:
        return self.hasher.compare(data.user_agent, data.ua_hash)

    async def validate(self, data: ValidateSessionDTO) -> SessionDTO:
        now = datetime.now(UTC).timestamp()
        session = await self.dao.get(GetSessionDTO(session_id=data.session_id))
        
        if session is None:
            logger.exception("Session ID not found.")
            raise UnauthorizedError
        if session.idle_exp is not None and session.idle_exp < now:
            logger.exception("Session ID is idle.")
            raise UnauthorizedError
        if session.abs_exp is not None and session.abs_exp < now:
            logger.exception("Session ID is expired.")
            raise UnauthorizedError

        return session
