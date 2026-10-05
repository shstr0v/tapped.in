from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.query import Query
from vnu.application.dto.music import FeedbackDTO
from vnu.application.interactors.music.common import current_profile


class ListReceivedFeedback(Query[None, list[FeedbackDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self) -> list[FeedbackDTO]:
        profile = await current_profile(self.dao, self.idp)
        return await self.dao.list_received_feedback(profile.id)
