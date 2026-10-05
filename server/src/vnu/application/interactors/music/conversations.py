from datetime import UTC, datetime
from uuid import UUID

from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import (
    ConversationSummaryDTO,
    MarkConversationReadDTO,
    MessageDTO,
    OpenConversationDTO,
    SendMessageDTO,
)
from vnu.application.errors.music import ConversationNotFoundError, ForbiddenMusicActionError, MusicProfileNotFoundError
from vnu.application.interactors.music.chat import (
    assert_shareable_beat,
    require_accepted_connection,
    require_conversation,
)
from vnu.application.interactors.music.common import current_profile
from vnu.domain.entities.music.entities import Conversation, Message
from vnu.domain.entities.music.enums import MessageTypeEnum
from vnu.domain.exceptions.music import InvalidMessageError


class OpenConversation(Interactor[OpenConversationDTO, ConversationSummaryDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: OpenConversationDTO) -> ConversationSummaryDTO:
        profile = await current_profile(self.dao, self.idp)
        if data.user_id == profile.user_id:
            raise InvalidMessageError("You cannot start a conversation with yourself.")
        target = await self.dao.get_profile_by_user_id(data.user_id)
        if target is None:
            raise MusicProfileNotFoundError("User not found.")
        await require_accepted_connection(self.repository, profile.id, target.id)

        draft = Conversation.create(profile.user_id, target.user_id)
        existing = await self.repository.get_conversation_between_users(profile.user_id, target.user_id)
        saved = existing if existing is not None else await self.repository.save_conversation(draft)
        if saved.id == draft.id:
            await self.uow.commit()
        return await self._summary(saved.id, profile.user_id)

    async def _summary(self, conversation_id: UUID, user_id: UUID) -> ConversationSummaryDTO:
        summary = await self.dao.get_conversation_summary(conversation_id, user_id)
        if summary is None:
            raise ConversationNotFoundError("Conversation not found.")
        return summary


class SendMessage(Interactor[SendMessageDTO, MessageDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: SendMessageDTO) -> MessageDTO:
        profile = await current_profile(self.dao, self.idp)
        conversation = await require_conversation(self.repository, data.conversation_id, profile.user_id)
        other_user_id = conversation.other_user_id(profile.user_id)
        other = await self.dao.get_profile_by_user_id(other_user_id)
        if other is None:
            raise ForbiddenMusicActionError("You can only message people you are connected with.")
        await require_accepted_connection(self.repository, profile.id, other.id)
        message = await self._message(data, conversation.id, profile.user_id, profile.id, other.id)
        await self.repository.save_message(message)
        await self.uow.commit()
        stored = await self.dao.get_message(message.id)
        if stored is None:
            raise ConversationNotFoundError("Message not found.")
        return stored

    async def _message(
        self,
        data: SendMessageDTO,
        conversation_id: UUID,
        sender_id: UUID,
        sender_profile_id: UUID,
        other_profile_id: UUID,
    ) -> Message:
        if data.type == MessageTypeEnum.TEXT:
            return Message.create_text(conversation_id, sender_id, data.text or "")
        if data.type == MessageTypeEnum.BEAT:
            if data.beat_id is None:
                raise InvalidMessageError("Beat messages require a beat.")
            await assert_shareable_beat(self.dao, sender_profile_id, other_profile_id, data.beat_id)
            return Message.create_beat(conversation_id, sender_id, data.beat_id)
        raise InvalidMessageError("Unsupported message type.")


class MarkConversationRead(Interactor[MarkConversationReadDTO, ConversationSummaryDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: MarkConversationReadDTO) -> ConversationSummaryDTO:
        profile = await current_profile(self.dao, self.idp)
        conversation = await require_conversation(self.repository, data.conversation_id, profile.user_id)
        await self.repository.mark_conversation_read(conversation.id, profile.user_id, datetime.now(UTC))
        await self.uow.commit()
        summary = await self.dao.get_conversation_summary(conversation.id, profile.user_id)
        if summary is None:
            raise ConversationNotFoundError("Conversation not found.")
        return summary
