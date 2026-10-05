from typing import Annotated, Literal, Self
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator, model_validator

from vnu.application.dto.music import MusicIdentityInputDTO, SendMessageDTO, SocialLinkInputDTO
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ExperienceLevelEnum,
    FeedbackCategoryEnum,
    MessageTypeEnum,
    MusicProfileRoleEnum,
    SocialPlatformEnum,
    SwipeActionEnum,
)


class MusicIdentityRequest(BaseModel):
    genres: list[str] = Field(default_factory=list)
    influences: list[str] = Field(default_factory=list)
    type_beats: list[str] = Field(default_factory=list)
    moods: list[str] = Field(default_factory=list)
    bpm_min: int | None = None
    bpm_max: int | None = None

    def to_dto(self) -> MusicIdentityInputDTO:
        return MusicIdentityInputDTO(
            genres=self.genres,
            influences=self.influences,
            type_beats=self.type_beats,
            moods=self.moods,
            bpm_min=self.bpm_min,
            bpm_max=self.bpm_max,
        )


class SocialLinkRequest(BaseModel):
    platform: SocialPlatformEnum
    url: str

    def to_dto(self) -> SocialLinkInputDTO:
        return SocialLinkInputDTO(platform=self.platform, url=self.url)


class UpsertMusicProfileRequest(BaseModel):
    role: MusicProfileRoleEnum
    artist_name: str
    experience_level: ExperienceLevelEnum
    collaboration_status: CollaborationStatusEnum = CollaborationStatusEnum.OPEN
    avatar_url: str | None = None
    location: str | None = None
    bio: str | None = None
    identity: MusicIdentityRequest | None = None
    socials: list[SocialLinkRequest] = Field(default_factory=list)


class UpdateMusicProfileRequest(BaseModel):
    role: MusicProfileRoleEnum | None = None
    artist_name: str | None = None
    experience_level: ExperienceLevelEnum | None = None
    collaboration_status: CollaborationStatusEnum | None = None
    avatar_url: str | None = None
    location: str | None = None
    bio: str | None = None
    identity: MusicIdentityRequest | None = None
    socials: list[SocialLinkRequest] | None = None


class CreateFeaturedUploadRequest(BaseModel):
    audio_url: str
    title: str
    genre: str | None = None
    tags: list[str] = Field(default_factory=list)
    bpm: int | None = None
    description: str | None = None


class CreateBeatRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    audio_key: str = Field(min_length=1, max_length=1024)
    genre: str | None = Field(default=None, max_length=80)
    tags: list[Annotated[str, Field(max_length=40)]] = Field(default_factory=list, max_length=16)
    bpm: int | None = Field(default=None, ge=1, le=400)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            message = "Title is required."
            raise ValueError(message)
        return stripped

    @field_validator("genre", "description")
    @classmethod
    def strip_optional(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class CreatePresignedUploadRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    content_type: str
    file_name: str = Field(validation_alias=AliasChoices("file_name", "filename"))
    folder: str = "uploads"
    upload_type: Literal["audio", "avatar", "beat"] | None = None


class PresignedUploadResponse(BaseModel):
    file_url: str
    key: str
    upload_url: str


class SwipeRequest(BaseModel):
    target_profile_id: UUID
    action: SwipeActionEnum


class CreateFeedbackRequest(BaseModel):
    target_upload_id: UUID
    category: FeedbackCategoryEnum
    quick_reaction: str | None = None
    text: str | None = None


class SendMessageRequest(BaseModel):
    type: MessageTypeEnum
    text: str | None = Field(default=None, max_length=2000)
    beat_id: UUID | None = None

    @model_validator(mode="after")
    def validate_payload(self) -> Self:
        if self.type == MessageTypeEnum.TEXT:
            text = (self.text or "").strip()
            if not text:
                message = "Text messages require non-empty text."
                raise ValueError(message)
            self.text = text
            if self.beat_id is not None:
                message = "Text messages cannot include a beat."
                raise ValueError(message)
            return self
        if self.beat_id is None:
            message = "Beat messages require beat_id."
            raise ValueError(message)
        if self.text is not None and self.text.strip():
            message = "Beat messages cannot include text."
            raise ValueError(message)
        return self

    def to_dto(self, conversation_id: UUID) -> SendMessageDTO:
        return SendMessageDTO(
            conversation_id=conversation_id,
            type=self.type,
            text=self.text if self.type == MessageTypeEnum.TEXT else None,
            beat_id=self.beat_id if self.type == MessageTypeEnum.BEAT else None,
        )
