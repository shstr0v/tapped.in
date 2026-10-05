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
    MusicProfileRoleEnum,
    NotificationTypeEnum,
    SocialPlatformEnum,
    SwipeActionEnum,
)
from vnu.domain.entities.music.value_objects import ensure_different_profiles
from vnu.domain.exceptions.music import InvalidMusicInteractionError, InvalidMusicUploadError


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
        if not audio_url or not title:
            raise InvalidMusicUploadError("Audio URL and title are required.")
        return cls(
            id=uuid.uuid4(),
            profile_id=profile_id,
            audio_url=audio_url,
            title=title,
            genre=genre,
            tags=tags or [],
            bpm=bpm,
            description=description,
            is_featured=True,
            created_at=datetime.now(UTC),
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


@dataclass(frozen=True)
class SocialLink(Entity):
    id: UUID
    profile_id: UUID
    platform: SocialPlatformEnum
    url: str
