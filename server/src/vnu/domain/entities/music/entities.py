import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from vnu.domain.common.entity import Entity
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    FeedbackCategoryEnum,
    MessageTypeEnum,
    MusicProfileRoleEnum,
    NotificationTypeEnum,
    SocialPlatformEnum,
    SwipeActionEnum,
)
from vnu.domain.entities.music.value_objects import ensure_different_profiles, ordered_user_ids
from vnu.domain.exceptions.music import InvalidMessageError, InvalidMusicInteractionError, InvalidMusicUploadError

MAX_MESSAGE_TEXT_LENGTH = 2000


@dataclass
class MusicIdentity(Entity):
    id: UUID
    profile_id: UUID
    genres: list[str] = field(default_factory=list)
    influences: list[str] = field(default_factory=list)
    type_beats: list[str] = field(default_factory=list)
    moods: list[str] = field(default_factory=list)
    bpm_min: int | None = None
    bpm_max: int | None = None

    def __post_init__(self) -> None:
        if self.bpm_min is not None and self.bpm_max is not None and self.bpm_min > self.bpm_max:
            raise InvalidMusicInteractionError("BPM min can not be greater than BPM max.")


@dataclass
class MusicProfile(Entity):
    id: UUID
    user_id: UUID
    role: MusicProfileRoleEnum
    artist_name: str
    experience_level: ExperienceLevelEnum
    collaboration_status: CollaborationStatusEnum
    created_at: datetime
    updated_at: datetime
    avatar_url: str | None = None
    location: str | None = None
    bio: str | None = None
    identity: MusicIdentity | None = None

    @classmethod
    def create(
        cls,
        user_id: UUID,
        role: MusicProfileRoleEnum,
        artist_name: str,
        experience_level: ExperienceLevelEnum,
        collaboration_status: CollaborationStatusEnum = CollaborationStatusEnum.OPEN,
        avatar_url: str | None = None,
        location: str | None = None,
        bio: str | None = None,
    ) -> "MusicProfile":
        now = datetime.now(UTC)
        return cls(
            id=uuid.uuid4(),
            user_id=user_id,
            role=role,
            artist_name=artist_name,
            avatar_url=avatar_url,
            location=location,
            experience_level=experience_level,
            bio=bio,
            collaboration_status=collaboration_status,
            created_at=now,
            updated_at=now,
        )

    def update(
        self,
        role: MusicProfileRoleEnum | None = None,
        artist_name: str | None = None,
        avatar_url: str | None = None,
        location: str | None = None,
        experience_level: ExperienceLevelEnum | None = None,
        bio: str | None = None,
        collaboration_status: CollaborationStatusEnum | None = None,
    ) -> None:
        self.role = role or self.role
        self.artist_name = artist_name or self.artist_name
        self.avatar_url = avatar_url if avatar_url is not None else self.avatar_url
        self.location = location if location is not None else self.location
        self.experience_level = experience_level or self.experience_level
        self.bio = bio if bio is not None else self.bio
        self.collaboration_status = collaboration_status or self.collaboration_status
        self.updated_at = datetime.now(UTC)


@dataclass
class MusicUpload(Entity):
    id: UUID
    profile_id: UUID
    audio_url: str
    title: str
    tags: list[str]
    is_featured: bool
    created_at: datetime
    genre: str | None = None
    bpm: int | None = None
    description: str | None = None

    @classmethod
    def create(
        cls,
        profile_id: UUID,
        audio_url: str,
        title: str,
        genre: str | None = None,
        tags: list[str] | None = None,
        bpm: int | None = None,
        description: str | None = None,
        *,
        is_featured: bool = False,
    ) -> "MusicUpload":
        cleaned_title = title.strip()
        cleaned_audio = audio_url.strip()
        if not cleaned_audio or not cleaned_title:
            raise InvalidMusicUploadError("Audio URL and title are required.")
        if len(cleaned_title) > 120:
            raise InvalidMusicUploadError("Title is too long.")
        cleaned_description = description.strip() if description else None
        return cls(
            id=uuid.uuid4(),
            profile_id=profile_id,
            audio_url=cleaned_audio,
            title=cleaned_title,
            genre=genre.strip() if genre else None,
            tags=[tag.strip() for tag in (tags or []) if tag and tag.strip()],
            bpm=bpm,
            description=cleaned_description or None,
            is_featured=is_featured,
            created_at=datetime.now(UTC),
        )

    @classmethod
    def create_featured(
        cls,
        profile_id: UUID,
        audio_url: str,
        title: str,
        genre: str | None = None,
        tags: list[str] | None = None,
        bpm: int | None = None,
        description: str | None = None,
    ) -> "MusicUpload":
        return cls.create(
            profile_id,
            audio_url,
            title,
            genre=genre,
            tags=tags,
            bpm=bpm,
            description=description,
            is_featured=True,
        )


@dataclass
class Swipe(Entity):
    id: UUID
    actor_profile_id: UUID
    target_profile_id: UUID
    action: SwipeActionEnum
    match_score: int
    created_at: datetime

    @classmethod
    def create(
        cls,
        actor_profile_id: UUID,
        target_profile_id: UUID,
        action: SwipeActionEnum,
        match_score: int,
    ) -> "Swipe":
        ensure_different_profiles(actor_profile_id, target_profile_id)
        return cls(
            id=uuid.uuid4(),
            actor_profile_id=actor_profile_id,
            target_profile_id=target_profile_id,
            action=action,
            match_score=match_score,
            created_at=datetime.now(UTC),
        )


@dataclass
class Connection(Entity):
    id: UUID
    requester_profile_id: UUID
    receiver_profile_id: UUID
    status: ConnectionStatusEnum
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create_pending(cls, requester_profile_id: UUID, receiver_profile_id: UUID) -> "Connection":
        ensure_different_profiles(requester_profile_id, receiver_profile_id)
        now = datetime.now(UTC)
        return cls(
            id=uuid.uuid4(),
            requester_profile_id=requester_profile_id,
            receiver_profile_id=receiver_profile_id,
            status=ConnectionStatusEnum.PENDING,
            created_at=now,
            updated_at=now,
        )

    def accept(self, actor_profile_id: UUID) -> None:
        if self.status != ConnectionStatusEnum.PENDING:
            raise InvalidMusicInteractionError("Only pending connections can be accepted.")
        if self.receiver_profile_id != actor_profile_id:
            raise InvalidMusicInteractionError("Only receiver can accept connection.")
        self.status = ConnectionStatusEnum.ACCEPTED
        self.updated_at = datetime.now(UTC)

    def reject(self, actor_profile_id: UUID) -> None:
        if self.status != ConnectionStatusEnum.PENDING:
            raise InvalidMusicInteractionError("Only pending connections can be rejected.")
        if self.receiver_profile_id != actor_profile_id:
            raise InvalidMusicInteractionError("Only receiver can reject connection.")
        self.status = ConnectionStatusEnum.REJECTED
        self.updated_at = datetime.now(UTC)


@dataclass
class Feedback(Entity):
    id: UUID
    author_profile_id: UUID
    target_upload_id: UUID
    category: FeedbackCategoryEnum
    created_at: datetime
    quick_reaction: str | None = None
    text: str | None = None

    @classmethod
    def create(
        cls,
        author_profile_id: UUID,
        target_profile_id: UUID,
        target_upload_id: UUID,
        category: FeedbackCategoryEnum,
        quick_reaction: str | None = None,
        text: str | None = None,
    ) -> "Feedback":
        ensure_different_profiles(author_profile_id, target_profile_id)
        return cls(
            id=uuid.uuid4(),
            author_profile_id=author_profile_id,
            target_upload_id=target_upload_id,
            category=category,
            quick_reaction=quick_reaction,
            text=text,
            created_at=datetime.now(UTC),
        )


@dataclass
class Notification(Entity):
    id: UUID
    user_id: UUID
    type: NotificationTypeEnum
    payload: dict[str, Any]
    is_read: bool
    created_at: datetime

    @classmethod
    def create(
        cls,
        user_id: UUID,
        type: NotificationTypeEnum,
        payload: dict[str, Any],
    ) -> "Notification":
        return cls(
            id=uuid.uuid4(),
            user_id=user_id,
            type=type,
            payload=payload,
            is_read=False,
            created_at=datetime.now(UTC),
        )


@dataclass
class Conversation(Entity):
    id: UUID
    user_1_id: UUID
    user_2_id: UUID
    created_at: datetime
    updated_at: datetime
    last_message_at: datetime | None = None

    @classmethod
    def create(cls, first_user_id: UUID, second_user_id: UUID) -> "Conversation":
        user_1_id, user_2_id = ordered_user_ids(first_user_id, second_user_id)
        now = datetime.now(UTC)
        return cls(
            id=uuid.uuid4(),
            user_1_id=user_1_id,
            user_2_id=user_2_id,
            created_at=now,
            updated_at=now,
        )

    def includes(self, user_id: UUID) -> bool:
        return user_id in {self.user_1_id, self.user_2_id}

    def other_user_id(self, user_id: UUID) -> UUID:
        if user_id == self.user_1_id:
            return self.user_2_id
        if user_id == self.user_2_id:
            return self.user_1_id
        raise InvalidMessageError("User is not part of this conversation.")


@dataclass
class Message(Entity):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    type: MessageTypeEnum
    created_at: datetime
    text: str | None = None
    beat_id: UUID | None = None
    read_at: datetime | None = None

    @classmethod
    def create_text(cls, conversation_id: UUID, sender_id: UUID, text: str) -> "Message":
        cleaned = text.strip()
        if not cleaned:
            raise InvalidMessageError("Text messages require non-empty text.")
        if len(cleaned) > MAX_MESSAGE_TEXT_LENGTH:
            raise InvalidMessageError("Text messages cannot be longer than 2000 characters.")
        return cls(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            sender_id=sender_id,
            type=MessageTypeEnum.TEXT,
            text=cleaned,
            created_at=datetime.now(UTC),
        )

    @classmethod
    def create_beat(cls, conversation_id: UUID, sender_id: UUID, beat_id: UUID) -> "Message":
        return cls(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            sender_id=sender_id,
            type=MessageTypeEnum.BEAT,
            beat_id=beat_id,
            created_at=datetime.now(UTC),
        )


@dataclass(frozen=True)
class SocialLink(Entity):
    id: UUID
    profile_id: UUID
    platform: SocialPlatformEnum
    url: str
