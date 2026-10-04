from vnu.application.common.interactor import Interactor
from vnu.application.common.auth.session import SessionService
from vnu.application.dto.session import DeleteSessionDTO
from vnu.adapters.auth.idp import BearerParser
from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.errors.auth import UnauthorizedError


class Logout(Interactor[None, None]):
    def __init__(
        self,
        bearer_parser: BearerParser,
        idp: SessionIdProvider,
        session_service: SessionService,
    ) -> None:
        self.bearer_parser = bearer_parser
        self.idp = idp
        self.session_service = session_service

    async def __call__(self) -> None:
        try:
            user_id = await self.idp.get_current_id()
            current_sid = self.idp.get_current_sid()
            await self.session_service.terminate(DeleteSessionDTO(user_id=user_id, session_id=current_sid))
        except UnauthorizedError:
            return
