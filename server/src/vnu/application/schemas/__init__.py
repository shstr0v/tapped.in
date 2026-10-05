from vnu.application.schemas.auth import (
    EmailLoginRequest,
    PhoneLoginRequest,
    PhoneLoginVerifyRequest,
    SignUpRequest,
    VerifyPhoneRequest,
)
from vnu.application.schemas.music import (
    CreateFeaturedUploadRequest,
    CreateFeedbackRequest,
    MusicIdentityRequest,
    SocialLinkRequest,
    SwipeRequest,
    UpdateMusicProfileRequest,
    UpsertMusicProfileRequest,
)
from vnu.application.schemas.user import CompleteUserRequest, CreateGuestRequest, UpdateUserRequest

__all__ = [
    "CompleteUserRequest",
    "CreateFeaturedUploadRequest",
    "CreateFeedbackRequest",
    "CreateGuestRequest",
    "EmailLoginRequest",
    "MusicIdentityRequest",
    "PhoneLoginRequest",
    "PhoneLoginVerifyRequest",
    "SignUpRequest",
    "SocialLinkRequest",
    "SwipeRequest",
    "UpdateMusicProfileRequest",
    "UpdateUserRequest",
    "UpsertMusicProfileRequest",
    "VerifyPhoneRequest",
]
