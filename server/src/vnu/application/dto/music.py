from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from uuid import UUID

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


@dataclass(frozen=True)
class MusicIdentityInputDTO:
    genres: list[str] = field(default_factory=list)
    influences: list[str] = field(default_factory=list)
    type_beats: list[str] = field(default_factory=list)
    moods: list[str] = field(default_factory=list)
    bpm_min: int | None = None
    bpm_max: int | None = None


@dataclass(frozen=True)
class SocialLinkInputDTO:
    platform: SocialPlatformEnum
    url: str


@dataclass(frozen=True)
class MusicIdentityDTO:
    genres: list[str]
    influences: list[str]
    type_beats: list[str]
    moods: list[str]
    bpm_min: int | None = None
    bpm_max: int | None = None


@dataclass(frozen=True)
class SocialLinkDTO:
    id: UUID
    platform: SocialPlatformEnum
    url: str


@dataclass(frozen=True)
class MusicUploadDTO:
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


@dataclass(frozen=True)
class MusicProfileDTO:
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
    identity: MusicIdentityDTO | None = None
    socials: list[SocialLinkDTO] = field(default_factory=list)
    featured_upload: MusicUploadDTO | None = None


@dataclass(frozen=True)
class UpsertMusicProfileDTO:
    role: MusicProfileRoleEnum
    artist_name: str
    experience_level: ExperienceLevelEnum
    collaboration_status: CollaborationStatusEnum = CollaborationStatusEnum.OPEN
    avatar_url: str | None = None
    location: str | None = None
    bio: str | None = None
    identity: MusicIdentityInputDTO | None = None
    socials: list[SocialLinkInputDTO] = field(default_factory=list)


@dataclass(frozen=True)
class UpdateMusicProfileDTO:
    role: MusicProfileRoleEnum | None = None
    artist_name: str | None = None
    experience_level: ExperienceLevelEnum | None = None
    collaboration_status: CollaborationStatusEnum | None = None
    avatar_url: str | None = None
    location: str | None = None
    bio: str | None = None
    identity: MusicIdentityInputDTO | None = None
    socials: list[SocialLinkInputDTO] | None = None


@dataclass(frozen=True)
class GetMusicProfileDTO:
    profile_id: UUID


@dataclass(frozen=True)
class CreateFeaturedUploadDTO:
    audio_url: str
    title: str
    genre: str | None = None
    tags: list[str] = field(default_factory=list)
    bpm: int | None = None
    description: str | None = None


@dataclass(frozen=True)
class DeleteUploadDTO:
    upload_id: UUID


@dataclass(frozen=True)
class RecommendationFiltersDTO:
    role: MusicProfileRoleEnum | None = None
    genre: str | None = None
    location: str | None = None
    limit: int = 10


@dataclass(frozen=True)
class MatchScoreDTO:
    score: int
    reasons: list[str]
    breakdown: dict[str, int]


@dataclass(frozen=True)
class FeedUserAccountDTO:
    id: UUID
    profile_id: UUID
    name: str
    role: MusicProfileRoleEnum
    tags: list[str]
    avatar_url: str | None = None
    location: str | None = None
    experience_level: ExperienceLevelEnum | None = None
    bio: str | None = None
    collaboration_status: CollaborationStatusEnum | None = None


@dataclass(frozen=True)
class FeedPreviewBeatDTO:
    id: UUID
    title: str
    audio_url: str
    tags: list[str]
    genre: str | None = None
    bpm: int | None = None
    description: str | None = None


@dataclass(frozen=True)
class FeedProfileDTO:
    id: UUID
    image_url: str | None
    user_account: FeedUserAccountDTO
    preview_beat: FeedPreviewBeatDTO


@dataclass(frozen=True)
class RecommendationCardDTO:
    profile: FeedProfileDTO
    match: MatchScoreDTO


@dataclass(frozen=True)
class SwipeInputDTO:
    target_profile_id: UUID
    action: SwipeActionEnum


@dataclass(frozen=True)
class SwipeDTO:
    id: UUID
    actor_profile_id: UUID
    target_profile_id: UUID
    action: SwipeActionEnum
    match_score: int
    created_at: datetime


@dataclass(frozen=True)
class ConnectionDTO:
    id: UUID
    requester_profile_id: UUID
    receiver_profile_id: UUID
    status: ConnectionStatusEnum
    created_at: datetime
    updated_at: datetime
    requester_profile: MusicProfileDTO | None = None
    receiver_profile: MusicProfileDTO | None = None


@dataclass(frozen=True)
class ConnectionProfileDTO:
    profile_id: UUID


@dataclass(frozen=True)
class ConnectionActionDTO:
    connection_id: UUID


@dataclass(frozen=True)
class CreateFeedbackDTO:
    target_upload_id: UUID
    category: FeedbackCategoryEnum
    quick_reaction: str | None = None
    text: str | None = None


@dataclass(frozen=True)
class FeedbackDTO:
    id: UUID
    author_profile_id: UUID
    target_upload_id: UUID
    category: FeedbackCategoryEnum
    created_at: datetime
    quick_reaction: str | None = None
    text: str | None = None
    author_profile: MusicProfileDTO | None = None
    target_upload: MusicUploadDTO | None = None


@dataclass(frozen=True)
class NotificationDTO:
    id: UUID
    user_id: UUID
    type: NotificationTypeEnum
    payload: dict[str, Any]
    is_read: bool
    created_at: datetime


@dataclass(frozen=True)
class MarkNotificationReadDTO:
    notification_id: UUID


@dataclass(frozen=True)
class ChatUserDTO:
    user_id: UUID
    artist_name: str
    profile_id: UUID | None = None
    avatar_url: str | None = None
    role: MusicProfileRoleEnum | None = None


@dataclass(frozen=True)
class BeatPreviewDTO:
    id: UUID
    profile_id: UUID
    audio_url: str
    title: str
    tags: list[str]
    genre: str | None = None
    bpm: int | None = None
    owner: ChatUserDTO | None = None


@dataclass(frozen=True)
class MessageDTO:
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    type: MessageTypeEnum
    created_at: datetime
    text: str | None = None
    beat: BeatPreviewDTO | None = None
    read_at: datetime | None = None


@dataclass(frozen=True)
class ConversationSummaryDTO:
    id: UUID
    other_user: ChatUserDTO
    last_message: MessageDTO | None
    last_message_at: datetime | None
    unread_count: int
    created_at: datetime


@dataclass(frozen=True)
class OpenConversationDTO:
    user_id: UUID


@dataclass(frozen=True)
class SendMessageDTO:
    conversation_id: UUID
    type: MessageTypeEnum
    text: str | None = None
    beat_id: UUID | None = None


@dataclass(frozen=True)
class ListMessagesDTO:
    conversation_id: UUID
    limit: int = 50
    before: datetime | None = None


@dataclass(frozen=True)
class MarkConversationReadDTO:
    conversation_id: UUID
