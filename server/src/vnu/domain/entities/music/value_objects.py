from dataclasses import dataclass
from uuid import UUID

from vnu.domain.common.value_object import UID, URL, Timestamp, ValueObject
from vnu.domain.exceptions.music import (
    InvalidMessageError,
    InvalidMusicInteractionError,
    InvalidMusicProfileError,
    InvalidMusicUploadError,
)

MAX_ARTIST_NAME_LENGTH = 80
MAX_LOCATION_LENGTH = 120
MAX_BIO_LENGTH = 500
MAX_TITLE_LENGTH = 120
MAX_DESCRIPTION_LENGTH = 500
MAX_FEEDBACK_TEXT_LENGTH = 1000
MAX_REACTION_LENGTH = 40
MIN_BPM = 1
MAX_BPM = 400


@dataclass(frozen=True)
class MusicProfileId(UID): ...


@dataclass(frozen=True)
class MusicIdentityId(UID): ...


@dataclass(frozen=True)
class SocialLinkId(UID): ...


@dataclass(frozen=True)
class MusicUploadId(UID): ...


@dataclass(frozen=True)
class SwipeId(UID): ...


@dataclass(frozen=True)
class ConnectionId(UID): ...


@dataclass(frozen=True)
class FeedbackId(UID): ...


@dataclass(frozen=True)
class NotificationId(UID): ...


@dataclass(frozen=True)
class UserId(UID): ...


@dataclass(frozen=True)
class ArtistName(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if not self.value or len(self.value) > MAX_ARTIST_NAME_LENGTH:
            raise InvalidMusicProfileError("Invalid artist name.")


@dataclass(frozen=True)
class Location(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if len(self.value) > MAX_LOCATION_LENGTH:
            raise InvalidMusicProfileError("Invalid location.")


@dataclass(frozen=True)
class Bio(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if len(self.value) > MAX_BIO_LENGTH:
            raise InvalidMusicProfileError("Invalid bio.")


@dataclass(frozen=True)
class AudioUrl(URL): ...


@dataclass(frozen=True)
class SocialUrl(URL): ...


@dataclass(frozen=True)
class UploadTitle(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if not self.value or len(self.value) > MAX_TITLE_LENGTH:
            raise InvalidMusicUploadError("Invalid upload title.")


@dataclass(frozen=True)
class UploadDescription(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if len(self.value) > MAX_DESCRIPTION_LENGTH:
            raise InvalidMusicUploadError("Invalid upload description.")


@dataclass(frozen=True)
class Bpm(ValueObject[int]):
    value: int

    def _validate(self) -> None:
        if self.value < MIN_BPM or self.value > MAX_BPM:
            raise InvalidMusicProfileError("Invalid BPM value.")


@dataclass(frozen=True)
class MatchScoreValue(ValueObject[int]):
    value: int

    def _validate(self) -> None:
        if self.value < 0 or self.value > 100:
            raise InvalidMusicInteractionError("Invalid match score.")


@dataclass(frozen=True)
class FeedbackText(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if len(self.value) > MAX_FEEDBACK_TEXT_LENGTH:
            raise InvalidMusicInteractionError("Invalid feedback text.")


@dataclass(frozen=True)
class QuickReaction(ValueObject[str]):
    value: str

    def _validate(self) -> None:
        if len(self.value) > MAX_REACTION_LENGTH:
            raise InvalidMusicInteractionError("Invalid quick reaction.")


@dataclass(frozen=True)
class CreatedAt(Timestamp): ...


@dataclass(frozen=True)
class UpdatedAt(Timestamp): ...


def ensure_different_profiles(first_profile_id: UUID, second_profile_id: UUID) -> None:
    if first_profile_id == second_profile_id:
        raise InvalidMusicInteractionError("Self interaction is not allowed.")


def ordered_user_ids(first_user_id: UUID, second_user_id: UUID) -> tuple[UUID, UUID]:
    if first_user_id == second_user_id:
        raise InvalidMessageError("You cannot start a conversation with yourself.")
    left, right = sorted((first_user_id, second_user_id), key=str)
    return left, right
