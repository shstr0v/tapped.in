import re
from uuid import UUID, uuid4

from vnu.application.dto.music import BeatDTO, ChatUserDTO, MusicProfileDTO, MusicUploadDTO
from vnu.domain.exceptions.music import InvalidMusicUploadError

BEAT_UPLOAD_TYPES = frozenset({"audio", "beat"})

_AUDIO_EXTENSIONS: dict[str, tuple[str, ...]] = {
    "audio/aac": ("aac",),
    "audio/mp4": ("m4a", "mp4"),
    "audio/mpeg": ("mp3", "mpeg"),
    "audio/wav": ("wav",),
    "audio/x-wav": ("wav",),
}

_DEFAULT_EXTENSION = {
    "audio/aac": "aac",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
}

_BEAT_KEY = re.compile(
    r"^beats/(?P<owner>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/"
    r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
    r"\.(?:aac|m4a|mp3|mp4|mpeg|wav)$"
)


def is_beat_upload(upload_type: str | None) -> bool:
    return (upload_type or "").strip().lower() in BEAT_UPLOAD_TYPES


def normalize_content_type(content_type: str) -> str:
    return content_type.split(";", 1)[0].strip().lower()


def extension_for_audio(content_type: str, file_name: str) -> str:
    normalized = normalize_content_type(content_type)
    allowed = _AUDIO_EXTENSIONS.get(normalized)
    if allowed is None:
        raise InvalidMusicUploadError("Unsupported audio type.")
    suffix = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""
    if suffix in allowed:
        return suffix
    return _DEFAULT_EXTENSION[normalized]


def new_beat_object_key(user_id: UUID, file_name: str, content_type: str) -> tuple[str, str]:
    normalized = normalize_content_type(content_type)
    extension = extension_for_audio(normalized, file_name)
    return normalized, f"beats/{user_id}/{uuid4()}.{extension}"


def require_owned_beat_key(audio_key: str, user_id: UUID) -> str:
    key = audio_key.strip().lstrip("/")
    match = _BEAT_KEY.fullmatch(key)
    if match is None or UUID(match.group("owner")) != user_id:
        raise InvalidMusicUploadError("Audio key does not belong to this account.")
    return key


def to_beat_dto(upload: MusicUploadDTO, owner: MusicProfileDTO) -> BeatDTO:
    return BeatDTO(
        id=upload.id,
        owner_id=owner.user_id,
        profile_id=upload.profile_id,
        title=upload.title,
        audio_url=upload.audio_url,
        audio_key=audio_key_from_url(upload.audio_url),
        genre=upload.genre,
        tags=list(upload.tags),
        bpm=upload.bpm,
        description=upload.description,
        is_featured=upload.is_featured,
        created_at=upload.created_at,
        owner=ChatUserDTO(
            user_id=owner.user_id,
            profile_id=owner.id,
            artist_name=owner.artist_name,
            avatar_url=owner.avatar_url,
            role=owner.role,
        ),
    )


def audio_key_from_url(audio_url: str) -> str | None:
    marker = ".amazonaws.com/"
    index = audio_url.find(marker)
    if index < 0:
        return None
    key = audio_url[index + len(marker) :].split("?", 1)[0]
    if _BEAT_KEY.fullmatch(key) is None:
        return None
    return key
