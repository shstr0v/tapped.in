from uuid import UUID

from pydantic import BaseModel, Field

from vnu.application.dto.music import MusicIdentityInputDTO, SocialLinkInputDTO
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ExperienceLevelEnum,
    FeedbackCategoryEnum,
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


class CreatePresignedUploadRequest(BaseModel):
    content_type: str
    file_name: str
    folder: str = "uploads"


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
