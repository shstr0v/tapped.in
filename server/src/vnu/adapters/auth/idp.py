import logging

from fastapi import Request

from vnu.domain.entities.user.value_objects import UserId
from vnu.application.errors.auth import BearerParserError, UnauthorizedError
from vnu.application.common.auth.idp import IdProvider
from vnu.application.common.auth.session import SessionService
from vnu.application.dto.session import GetSessionDTO, ValidateSessionDTO

TOKEN_SECTIONS = 2
TOKEN_HEADER = "Authorization"
TOKEN_TYPE = "Bearer"


logger = logging.getLogger(__name__)


class BearerParser:
    def parse(self, headers: dict[str, str]) -> str:
        bearer = headers.get(TOKEN_HEADER)
        if bearer is None:
            logger.exception("Bearer header not found")
            raise BearerParserError("Authorization header not found")

        sections = bearer.split(" ")
        if len(sections) != TOKEN_SECTIONS:
            logger.exception("Token sections length is invalid.")
            raise BearerParserError("Token sections length is invalid.")

        token_type, data = sections
        if token_type != TOKEN_TYPE:
            logger.exception("Token type is invalid.")
            raise BearerParserError("Token type is invalid.")

        return data


COOKIE_KEY = "sid"

class SessionIdProvider(IdProvider):
    _sid: str | None = None

    def __init__(
        self,
        request: Request,
        session_service: SessionService,
    ) -> None:
        self.request = request
        self.session_service = session_service
        
    def _parse_sid(self) -> str | None:
        return self.request.cookies.get(COOKIE_KEY)

    async def get_current_id(self) -> UserId:
        try:
            sid = self._parse_sid()
            if sid is None:
                raise UnauthorizedError
            
            ua = self.request.headers.get("User-Agent")
            session = await self.session_service.validate(ValidateSessionDTO(session_id=sid, user_agent=ua))

            self._sid = sid

            return UserId(session.user_id)
        except BearerParserError as e:
            logger.exception("An error occurred while parsing the bearer token.", e)
            raise UnauthorizedError

    def get_current_sid(self) -> str | None:
        try:
            if self._sid is None:
                logger.exception("Session not found. Parsing new one from http request.")
                self._sid = self._parse_sid()
            return self._sid
        except BearerParserError as e:
            logger.exception("An error occurred while parsing the bearer token.", e)
            raise UnauthorizedError
