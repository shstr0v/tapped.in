from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.query import Query
from vnu.application.dto.music import ConnectionDTO
from vnu.application.interactors.music.common import current_profile


class ListConnections(Query[None, list[ConnectionDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self) -> list[ConnectionDTO]:
        profile = await current_profile(self.dao, self.idp)
        return await self.dao.list_connections(profile.id)
