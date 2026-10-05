import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    TIMESTAMP,
    UUID,
    Boolean,
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from vnu.adapters.data.models.base import Base
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


class MusicProfileModel(Base):
    __tablename__ = "music_profile"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    role: Mapped[str] = mapped_column(
        Enum(*(item.value for item in MusicProfileRoleEnum), name="music_profile_role_enum"),
        nullable=False,
    )
    artist_name: Mapped[str] = mapped_column(String(80), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    experience_level: Mapped[str] = mapped_column(
        Enum(*(item.value for item in ExperienceLevelEnum), name="music_experience_level_enum"),
        nullable=False,
    )
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    collaboration_status: Mapped[str] = mapped_column(
        Enum(*(item.value for item in CollaborationStatusEnum), name="collaboration_status_enum"),
        nullable=False,
        default=CollaborationStatusEnum.OPEN.value,
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


class MusicIdentityModel(Base):
    __tablename__ = "music_identity"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    genres: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    influences: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    type_beats: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    moods: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    bpm_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bpm_max: Mapped[int | None] = mapped_column(Integer, nullable=True)


class SocialLinkModel(Base):
    __tablename__ = "social_link"
    __table_args__ = (UniqueConstraint("profile_id", "platform", name="uq_social_link_profile_platform"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    platform: Mapped[str] = mapped_column(
        Enum(*(item.value for item in SocialPlatformEnum), name="social_platform_enum"),
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String(2048), nullable=False)


class MusicUploadModel(Base):
    __tablename__ = "music_upload"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    audio_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    genre: Mapped[str | None] = mapped_column(String(80), nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    bpm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


class SwipeModel(Base):
    __tablename__ = "swipe"
    __table_args__ = (
        UniqueConstraint("actor_profile_id", "target_profile_id", name="uq_swipe_actor_target"),
        CheckConstraint("actor_profile_id <> target_profile_id", name="ck_swipe_not_self"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    actor_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column(
        Enum(*(item.value for item in SwipeActionEnum), name="swipe_action_enum"),
        nullable=False,
    )
    match_score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


class ConnectionModel(Base):
    __tablename__ = "connection"
    __table_args__ = (
        UniqueConstraint("pair_first_profile_id", "pair_second_profile_id", name="uq_connection_profile_pair"),
        CheckConstraint("requester_profile_id <> receiver_profile_id", name="ck_connection_not_self"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    requester_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    receiver_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    pair_first_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    pair_second_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum(*(item.value for item in ConnectionStatusEnum), name="connection_status_enum"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


class FeedbackModel(Base):
    __tablename__ = "feedback"
    __table_args__ = (CheckConstraint("author_profile_id IS NOT NULL", name="ck_feedback_author_present"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    author_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_upload_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_upload.id", ondelete="CASCADE"),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        Enum(*(item.value for item in FeedbackCategoryEnum), name="feedback_category_enum"),
        nullable=False,
    )
    quick_reaction: Mapped[str | None] = mapped_column(String(40), nullable=True)
    text: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


class NotificationModel(Base):
    __tablename__ = "notification"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        Enum(*(item.value for item in NotificationTypeEnum), name="notification_type_enum"),
        nullable=False,
    )
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


class ConversationModel(Base):
    __tablename__ = "conversation"
    __table_args__ = (
        UniqueConstraint("user_1_id", "user_2_id", name="uq_conversation_user_pair"),
        CheckConstraint("user_1_id::text < user_2_id::text", name="ck_conversation_user_order"),
        Index("ix_conversation_user_1_id", "user_1_id"),
        Index("ix_conversation_user_2_id", "user_2_id"),
        Index("ix_conversation_last_message_at", "last_message_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_1_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_2_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    last_message_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class MessageModel(Base):
    __tablename__ = "message"
    __table_args__ = (
        CheckConstraint(
            "(type = 'text' AND text IS NOT NULL AND btrim(text) <> '' AND beat_id IS NULL) "
            "OR (type = 'beat' AND text IS NULL)",
            name="ck_message_payload",
        ),
        Index("ix_message_conversation_created_at", "conversation_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversation.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        Enum(*(item.value for item in MessageTypeEnum), name="message_type_enum"),
        nullable=False,
    )
    text: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    beat_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("music_upload.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
