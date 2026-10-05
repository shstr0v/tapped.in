from datetime import UTC

from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.query import Query
from vnu.application.dto.music import ConversationSummaryDTO, ListMessagesDTO, MessageDTO
from vnu.application.interactors.music.chat import require_conversation
from vnu.application.interactors.music.common import current_profile

MAX_MESSAGE_PAGE_SIZE = 100


class ListConversations(Query[None, list[ConversationSummaryDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self) -> list[ConversationSummaryDTO]:
        profile = await current_profile(self.dao, self.idp)
        return await self.dao.list_conversation_summaries(profile.user_id)


class ListMessages(Query[ListMessagesDTO, list[MessageDTO]]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.idp = idp

    async def __call__(self, data: ListMessagesDTO) -> list[MessageDTO]:
        profile = await current_profile(self.dao, self.idp)
        await require_conversation(self.repository, data.conversation_id, profile.user_id)
        limit = min(max(data.limit, 1), MAX_MESSAGE_PAGE_SIZE)
        before = data.before
        if before is not None and before.tzinfo is None:
            before = before.replace(tzinfo=UTC)
        return await self.dao.list_messages(data.conversation_id, limit=limit, before=before)
