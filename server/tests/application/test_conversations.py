from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from vnu.application.dto.music import (
    BeatPreviewDTO,
    ChatUserDTO,
    ConversationSummaryDTO,
    ListMessagesDTO,
    MarkConversationReadDTO,
    MessageDTO,
    MusicProfileDTO,
    MusicUploadDTO,
    OpenConversationDTO,
    SendMessageDTO,
)
from vnu.application.errors.music import ConversationNotFoundError, ForbiddenMusicActionError, MusicUploadNotFoundError
from vnu.application.interactors.music import MarkConversationRead, OpenConversation, SendMessage
from vnu.application.queries.music import ListConversations, ListMessages
from vnu.application.schemas.music import SendMessageRequest
from vnu.domain.entities.music.entities import Connection, Conversation, Message
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    MessageTypeEnum,
    MusicProfileRoleEnum,
)
from vnu.domain.entities.music.value_objects import ordered_user_ids
from vnu.domain.entities.user.value_objects import UserId
from vnu.domain.exceptions.music import InvalidMessageError


class FakeIdp:
    def __init__(self, user_id: UUID) -> None:
        self.user_id = user_id

    async def get_current_id(self) -> UserId:
        return UserId(self.user_id)


class FakeUoW:
    def __init__(self) -> None:
        self.commits = 0

    async def commit(self) -> None:
        self.commits += 1

    async def rollback(self) -> None:
        return None

    async def flush(self) -> None:
        return None


class ChatStore:
    def __init__(self, profiles: list[MusicProfileDTO]) -> None:
        self.profiles = {profile.id: profile for profile in profiles}
        self.uploads: dict[UUID, MusicUploadDTO] = {}
        self.connections: dict[frozenset[UUID], Connection] = {}
        self.conversations: dict[UUID, Conversation] = {}
        self.messages: list[Message] = []

    def profile_by_user_id(self, user_id: UUID) -> MusicProfileDTO | None:
        return next((profile for profile in self.profiles.values() if profile.user_id == user_id), None)

    def conversation_between(self, first_user_id: UUID, second_user_id: UUID) -> Conversation | None:
        user_1_id, user_2_id = ordered_user_ids(first_user_id, second_user_id)
        return next(
            (
                conversation
                for conversation in self.conversations.values()
                if conversation.user_1_id == user_1_id and conversation.user_2_id == user_2_id
            ),
            None,
        )


class FakeMusicDAO:
    def __init__(self, store: ChatStore) -> None:
        self.store = store

    async def get_profile_by_user_id(self, user_id: UUID) -> MusicProfileDTO | None:
        return self.store.profile_by_user_id(user_id)

    async def get_profile_by_id(self, profile_id: UUID) -> MusicProfileDTO | None:
        return self.store.profiles.get(profile_id)

    async def get_upload(self, upload_id: UUID) -> MusicUploadDTO | None:
        return self.store.uploads.get(upload_id)

    async def list_conversation_summaries(self, user_id: UUID) -> list[ConversationSummaryDTO]:
        conversations = [
            conversation
            for conversation in self.store.conversations.values()
            if conversation.includes(user_id)
        ]
        conversations.sort(
            key=lambda conversation: conversation.last_message_at or conversation.created_at,
            reverse=True,
        )
        return [self._summary(conversation, user_id) for conversation in conversations]

    async def get_conversation_summary(self, conversation_id: UUID, user_id: UUID) -> ConversationSummaryDTO | None:
        conversation = self.store.conversations.get(conversation_id)
        if conversation is None or not conversation.includes(user_id):
            return None
        return self._summary(conversation, user_id)

    async def list_messages(
        self,
        conversation_id: UUID,
        *,
        limit: int,
        before: datetime | None,
    ) -> list[MessageDTO]:
        messages = [message for message in self.store.messages if message.conversation_id == conversation_id]
        if before is not None:
            messages = [message for message in messages if message.created_at < before]
        messages.sort(key=lambda message: (message.created_at, message.id), reverse=True)
        selected = list(reversed(messages[:limit]))
        return [self._message_dto(message) for message in selected]

    async def get_message(self, message_id: UUID) -> MessageDTO | None:
        message = next((item for item in self.store.messages if item.id == message_id), None)
        return self._message_dto(message) if message else None

    def _summary(self, conversation: Conversation, user_id: UUID) -> ConversationSummaryDTO:
        other = self.store.profile_by_user_id(conversation.other_user_id(user_id))
        messages = [message for message in self.store.messages if message.conversation_id == conversation.id]
        last = max(messages, key=lambda message: (message.created_at, message.id)) if messages else None
        unread = sum(1 for message in messages if message.sender_id != user_id and message.read_at is None)
        return ConversationSummaryDTO(
            id=conversation.id,
            other_user=_chat_user(other),
            last_message=self._message_dto(last) if last else None,
            last_message_at=conversation.last_message_at,
            unread_count=unread,
            created_at=conversation.created_at,
        )

    def _message_dto(self, message: Message) -> MessageDTO:
        beat = None
        if message.beat_id is not None:
            upload = self.store.uploads.get(message.beat_id)
            if upload is not None and upload.audio_url.strip():
                beat = BeatPreviewDTO(
                    id=upload.id,
                    profile_id=upload.profile_id,
                    audio_url=upload.audio_url,
                    title=upload.title,
                    genre=upload.genre,
                    tags=upload.tags,
                    bpm=upload.bpm,
                    owner=_chat_user(self.store.profiles.get(upload.profile_id)),
                )
        return MessageDTO(
            id=message.id,
            conversation_id=message.conversation_id,
            sender_id=message.sender_id,
            type=message.type,
            text=message.text,
            beat=beat,
            created_at=message.created_at,
            read_at=message.read_at,
        )


class FakeMusicRepository:
    def __init__(self, store: ChatStore) -> None:
        self.store = store

    async def get_connection_between(self, first_profile_id: UUID, second_profile_id: UUID) -> Connection | None:
        return self.store.connections.get(frozenset((first_profile_id, second_profile_id)))

    async def get_conversation(self, conversation_id: UUID) -> Conversation | None:
        return self.store.conversations.get(conversation_id)

    async def get_conversation_between_users(self, first_user_id: UUID, second_user_id: UUID) -> Conversation | None:
        return self.store.conversation_between(first_user_id, second_user_id)

    async def save_conversation(self, conversation: Conversation) -> Conversation:
        existing = self.store.conversation_between(conversation.user_1_id, conversation.user_2_id)
        if existing is not None:
            return existing
        self.store.conversations[conversation.id] = conversation
        return conversation

    async def save_message(self, message: Message) -> None:
        self.store.messages.append(message)
        conversation = self.store.conversations[message.conversation_id]
        conversation.last_message_at = message.created_at
        conversation.updated_at = message.created_at

    async def mark_conversation_read(self, conversation_id: UUID, reader_user_id: UUID, read_at: datetime) -> None:
        for message in self.store.messages:
            unread = message.conversation_id == conversation_id and message.sender_id != reader_user_id
            if unread and message.read_at is None:
                message.read_at = read_at


def _profile(user_id: UUID | None = None, *, artist_name: str = "Artist") -> MusicProfileDTO:
    now = datetime.now(UTC)
    return MusicProfileDTO(
        id=uuid4(),
        user_id=user_id or uuid4(),
        role=MusicProfileRoleEnum.PRODUCER,
        artist_name=artist_name,
        avatar_url="https://example.com/avatar.jpg",
        location="Bucharest",
        experience_level=ExperienceLevelEnum.INTERMEDIATE,
        collaboration_status=CollaborationStatusEnum.OPEN,
        created_at=now,
        updated_at=now,
    )


def _upload(
    profile_id: UUID,
    *,
    title: str = "crazy beat",
    audio_url: str = "https://example.com/beat.mp3",
) -> MusicUploadDTO:
    return MusicUploadDTO(
        id=uuid4(),
        profile_id=profile_id,
        audio_url=audio_url,
        title=title,
        genre="rage",
        tags=["rage"],
        bpm=140,
        is_featured=True,
        created_at=datetime.now(UTC),
    )


def _chat_user(profile: MusicProfileDTO | None) -> ChatUserDTO:
    if profile is None:
        return ChatUserDTO(user_id=uuid4(), artist_name="")
    return ChatUserDTO(
        user_id=profile.user_id,
        profile_id=profile.id,
        artist_name=profile.artist_name,
        avatar_url=profile.avatar_url,
        role=profile.role,
    )


def _accept(requester: MusicProfileDTO, receiver: MusicProfileDTO) -> Connection:
    connection = Connection.create_pending(requester.id, receiver.id)
    connection.accept(receiver.id)
    return connection


def _services(store: ChatStore, user_id: UUID) -> tuple[FakeMusicRepository, FakeMusicDAO, FakeUoW, FakeIdp]:
    return FakeMusicRepository(store), FakeMusicDAO(store), FakeUoW(), FakeIdp(user_id)


async def test_open_conversation_requires_an_accepted_connection() -> None:
    me = _profile(artist_name="Me")
    them = _profile(artist_name="Them")
    store = ChatStore([me, them])
    store.connections[frozenset((me.id, them.id))] = Connection.create_pending(me.id, them.id)
    repository, dao, uow, idp = _services(store, me.user_id)

    with pytest.raises(ForbiddenMusicActionError, match="connected"):
        await OpenConversation(repository, dao, uow, idp)(OpenConversationDTO(user_id=them.user_id))

    assert store.conversations == {}
    assert uow.commits == 0


async def test_open_conversation_returns_the_same_direct_chat() -> None:
    me = _profile(artist_name="Me")
    them = _profile(artist_name="Them")
    store = ChatStore([me, them])
    store.connections[frozenset((me.id, them.id))] = _accept(me, them)
    repository, dao, uow, idp = _services(store, me.user_id)
    interactor = OpenConversation(repository, dao, uow, idp)

    first = await interactor(OpenConversationDTO(user_id=them.user_id))
    second = await interactor(OpenConversationDTO(user_id=them.user_id))
    _, their_dao, their_uow, their_idp = _services(store, them.user_id)
    mirrored = await OpenConversation(repository, their_dao, their_uow, their_idp)(
        OpenConversationDTO(user_id=me.user_id)
    )

    assert first.id == second.id == mirrored.id
    assert first.other_user.user_id == them.user_id
    assert first.other_user.artist_name == "Them"
    assert mirrored.other_user.user_id == me.user_id
    assert len(store.conversations) == 1
    assert uow.commits == 1


async def test_send_text_uses_the_authenticated_sender_and_blocks_after_disconnect() -> None:
    me = _profile(artist_name="Me")
    them = _profile(artist_name="Them")
    outsider = _profile(artist_name="Outsider")
    store = ChatStore([me, them, outsider])
    store.connections[frozenset((me.id, them.id))] = _accept(me, them)
    repository, dao, uow, idp = _services(store, me.user_id)
    opened = await OpenConversation(repository, dao, uow, idp)(OpenConversationDTO(user_id=them.user_id))

    message = await SendMessage(repository, dao, uow, idp)(
        SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.TEXT, text="  yo this beat is crazy  ")
    )

    assert message.sender_id == me.user_id
    assert message.text == "yo this beat is crazy"
    assert message.type == MessageTypeEnum.TEXT
    assert message.beat is None

    store.connections[frozenset((me.id, them.id))].status = ConnectionStatusEnum.REJECTED
    history = await ListMessages(repository, dao, idp)(ListMessagesDTO(conversation_id=opened.id, limit=50))
    assert [item.text for item in history] == ["yo this beat is crazy"]
    with pytest.raises(ForbiddenMusicActionError, match="connected"):
        await SendMessage(repository, dao, uow, idp)(
            SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.TEXT, text="still there?")
        )
    with pytest.raises(ConversationNotFoundError):
        await ListMessages(repository, dao, FakeIdp(outsider.user_id))(ListMessagesDTO(conversation_id=opened.id))


async def test_send_beat_embeds_a_playable_preview_for_conversation_beats_only() -> None:
    me = _profile(artist_name="Me")
    them = _profile(artist_name="Them")
    stranger = _profile(artist_name="Stranger")
    store = ChatStore([me, them, stranger])
    store.connections[frozenset((me.id, them.id))] = _accept(me, them)
    mine = _upload(me.id, title="my beat")
    theirs = _upload(them.id, title="their beat")
    outside = _upload(stranger.id, title="not ours")
    silent = _upload(me.id, title="silent", audio_url="  ")
    store.uploads = {mine.id: mine, theirs.id: theirs, outside.id: outside, silent.id: silent}
    repository, dao, uow, idp = _services(store, me.user_id)
    opened = await OpenConversation(repository, dao, uow, idp)(OpenConversationDTO(user_id=them.user_id))
    sender = SendMessage(repository, dao, uow, idp)

    shared = await sender(SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.BEAT, beat_id=mine.id))
    reshared = await sender(SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.BEAT, beat_id=theirs.id))

    assert shared.beat is not None
    assert shared.beat.id == mine.id
    assert shared.beat.title == "my beat"
    assert shared.beat.audio_url == mine.audio_url
    assert shared.beat.bpm == 140
    assert shared.beat.owner is not None
    assert shared.beat.owner.artist_name == "Me"
    assert shared.text is None
    assert reshared.beat is not None
    assert reshared.beat.owner is not None
    assert reshared.beat.owner.user_id == them.user_id
    with pytest.raises(ForbiddenMusicActionError, match="this conversation"):
        await sender(SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.BEAT, beat_id=outside.id))
    with pytest.raises(ForbiddenMusicActionError, match="playable audio"):
        await sender(SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.BEAT, beat_id=silent.id))
    with pytest.raises(MusicUploadNotFoundError):
        await sender(SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.BEAT, beat_id=uuid4()))


async def test_mark_read_clears_only_the_other_users_messages() -> None:
    me = _profile(artist_name="Me")
    them = _profile(artist_name="Them")
    store = ChatStore([me, them])
    store.connections[frozenset((me.id, them.id))] = _accept(me, them)
    repository, dao, uow, idp = _services(store, me.user_id)
    opened = await OpenConversation(repository, dao, uow, idp)(OpenConversationDTO(user_id=them.user_id))
    await SendMessage(repository, dao, uow, idp)(
        SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.TEXT, text="first")
    )
    their_repository, their_dao, their_uow, their_idp = _services(store, them.user_id)
    await SendMessage(their_repository, their_dao, their_uow, their_idp)(
        SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.TEXT, text="second")
    )

    inbox = await ListConversations(dao, idp)()
    assert inbox[0].unread_count == 1
    assert inbox[0].last_message is not None
    assert inbox[0].last_message.text == "second"

    await MarkConversationRead(repository, dao, uow, idp)(MarkConversationReadDTO(conversation_id=opened.id))
    reread = await ListConversations(dao, idp)()
    assert reread[0].unread_count == 0
    their_inbox = await ListConversations(their_dao, their_idp)()
    assert their_inbox[0].unread_count == 1


async def test_message_history_returns_the_latest_page_in_chronological_order() -> None:
    me = _profile()
    them = _profile()
    store = ChatStore([me, them])
    store.connections[frozenset((me.id, them.id))] = _accept(me, them)
    repository, dao, uow, idp = _services(store, me.user_id)
    opened = await OpenConversation(repository, dao, uow, idp)(OpenConversationDTO(user_id=them.user_id))
    sender = SendMessage(repository, dao, uow, idp)
    for index in range(3):
        await sender(SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.TEXT, text=f"m{index}"))
        store.messages[-1].created_at = datetime.now(UTC) + timedelta(seconds=index)

    page = await ListMessages(repository, dao, idp)(ListMessagesDTO(conversation_id=opened.id, limit=2))
    older = await ListMessages(repository, dao, idp)(
        ListMessagesDTO(conversation_id=opened.id, limit=2, before=page[0].created_at)
    )

    assert [message.text for message in page] == ["m1", "m2"]
    assert [message.text for message in older] == ["m0"]


def test_send_message_request_rejects_empty_text() -> None:
    with pytest.raises(ValidationError):
        SendMessageRequest(type=MessageTypeEnum.TEXT, text="   ")
    with pytest.raises(ValidationError):
        SendMessageRequest(type=MessageTypeEnum.BEAT)

    request = SendMessageRequest(type=MessageTypeEnum.TEXT, text="  hello  ")
    assert request.to_dto(uuid4()).text == "hello"


async def test_blank_text_is_rejected_before_it_is_stored() -> None:
    me = _profile()
    them = _profile()
    store = ChatStore([me, them])
    store.connections[frozenset((me.id, them.id))] = _accept(me, them)
    repository, dao, uow, idp = _services(store, me.user_id)
    opened = await OpenConversation(repository, dao, uow, idp)(OpenConversationDTO(user_id=them.user_id))

    with pytest.raises(InvalidMessageError, match="non-empty"):
        await SendMessage(repository, dao, uow, idp)(
            SendMessageDTO(conversation_id=opened.id, type=MessageTypeEnum.TEXT, text="   ")
        )

    assert store.messages == []
