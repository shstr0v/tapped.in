from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.query import Query
from vnu.application.dto.music import NotificationDTO
from vnu.application.interactors.music.common import current_user_id


class ListNotifications(Query[None, list[NotificationDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self) -> list[NotificationDTO]:
        return await self.dao.list_notifications(await current_user_id(self.idp))
