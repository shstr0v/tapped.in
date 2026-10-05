from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from vnu.adapters.config import AwsConfig
from vnu.application.dto.music import CreateBeatDTO, GetBeatDTO, MusicProfileDTO, MusicUploadDTO
from vnu.application.interactors.music.beat_audio import (
    audio_key_from_url,
    extension_for_audio,
    new_beat_object_key,
    require_owned_beat_key,
)
from vnu.application.interactors.music.beats import CreateBeat
from vnu.application.queries.music.beats import GetBeat, ListMyBeats
from vnu.domain.entities.music.entities import MusicUpload
from vnu.domain.entities.music.enums import CollaborationStatusEnum, ExperienceLevelEnum, MusicProfileRoleEnum
from vnu.domain.entities.user.value_objects import UserId
from vnu.domain.exceptions.music import InvalidMusicUploadError


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


class FakeMusicDAO:
    def __init__(self, profile: MusicProfileDTO) -> None:
        self.profile = profile
        self.uploads: dict[UUID, MusicUploadDTO] = {}

    async def get_profile_by_user_id(self, user_id: UUID) -> MusicProfileDTO | None:
        if self.profile.user_id == user_id:
            return self.profile
        return None

    async def get_profile_by_id(self, profile_id: UUID) -> MusicProfileDTO | None:
        if self.profile.id == profile_id:
            return self.profile
        return None

    async def get_upload(self, upload_id: UUID) -> MusicUploadDTO | None:
        return self.uploads.get(upload_id)

    async def list_uploads(self, profile_id: UUID) -> list[MusicUploadDTO]:
        uploads = [upload for upload in self.uploads.values() if upload.profile_id == profile_id]
        return sorted(uploads, key=lambda upload: upload.created_at, reverse=True)


class FakeMusicRepository:
    def __init__(self, dao: FakeMusicDAO) -> None:
        self.dao = dao

    async def save_upload(self, upload: MusicUpload) -> MusicUploadDTO:
        if upload.is_featured:
            for upload_id, existing in list(self.dao.uploads.items()):
                if existing.profile_id == upload.profile_id and existing.is_featured:
                    self.dao.uploads[upload_id] = replace(existing, is_featured=False)
        dto = MusicUploadDTO(
            id=upload.id,
            profile_id=upload.profile_id,
            audio_url=upload.audio_url,
            title=upload.title,
            genre=upload.genre,
            tags=list(upload.tags),
            bpm=upload.bpm,
            description=upload.description,
            is_featured=upload.is_featured,
            created_at=upload.created_at,
        )
        self.dao.uploads[dto.id] = dto
        return dto


def _profile(user_id: UUID) -> MusicProfileDTO:
    now = datetime.now(UTC)
    return MusicProfileDTO(
        id=uuid4(),
        user_id=user_id,
        role=MusicProfileRoleEnum.PRODUCER,
        artist_name="Night",
        avatar_url="https://example.com/avatar.jpg",
        location="Bucharest",
        experience_level=ExperienceLevelEnum.INTERMEDIATE,
        collaboration_status=CollaborationStatusEnum.OPEN,
        created_at=now,
        updated_at=now,
    )


def _config() -> AwsConfig:
    return AwsConfig(
        access_key="test-access-key",
        secret_key="test-secret-key",  # noqa: S106
        bucket_name="tappedin",
        region="eu-central-1",
    )


def _key(user_id: UUID, extension: str = "mp3") -> str:
    return f"beats/{user_id}/{uuid4()}.{extension}"


@pytest.mark.asyncio
async def test_create_beat_stores_owned_s3_audio_and_features_it() -> None:
    user_id = uuid4()
    profile = _profile(user_id)
    dao = FakeMusicDAO(profile)
    uow = FakeUoW()
    interactor = CreateBeat(FakeMusicRepository(dao), dao, uow, FakeIdp(user_id), _config())
    key = _key(user_id)

    beat = await interactor(
        CreateBeatDTO(audio_key=key, title="Night Drive", genre="Rage", tags=["rage"], description="loop")
    )

    assert beat.owner_id == user_id
    assert beat.profile_id == profile.id
    assert beat.audio_key == key
    assert beat.audio_url == f"https://tappedin.s3.eu-central-1.amazonaws.com/{key}"
    assert beat.is_featured is True
    assert beat.owner is not None
    assert beat.owner.artist_name == "Night"
    assert uow.commits == 1


@pytest.mark.asyncio
async def test_newer_beat_becomes_the_feed_preview_without_deleting_the_previous_one() -> None:
    user_id = uuid4()
    profile = _profile(user_id)
    dao = FakeMusicDAO(profile)
    interactor = CreateBeat(FakeMusicRepository(dao), dao, FakeUoW(), FakeIdp(user_id), _config())

    first = await interactor(CreateBeatDTO(audio_key=_key(user_id), title="One"))
    second = await interactor(CreateBeatDTO(audio_key=_key(user_id, "wav"), title="Two"))

    assert {upload.title for upload in dao.uploads.values()} == {"One", "Two"}
    assert dao.uploads[first.id].is_featured is False
    assert dao.uploads[second.id].is_featured is True


@pytest.mark.asyncio
async def test_create_beat_rejects_keys_outside_the_caller_upload_path() -> None:
    user_id = uuid4()
    profile = _profile(user_id)
    dao = FakeMusicDAO(profile)
    interactor = CreateBeat(FakeMusicRepository(dao), dao, FakeUoW(), FakeIdp(user_id), _config())

    with pytest.raises(InvalidMusicUploadError):
        await interactor(CreateBeatDTO(audio_key="https://evil.example/beat.mp3", title="Nope"))
    with pytest.raises(InvalidMusicUploadError):
        await interactor(CreateBeatDTO(audio_key=_key(uuid4()), title="Nope"))
    with pytest.raises(InvalidMusicUploadError):
        await interactor(CreateBeatDTO(audio_key=f"beats/{user_id}/../{uuid4()}.mp3", title="Nope"))

    assert dao.uploads == {}


@pytest.mark.asyncio
async def test_beat_can_be_listed_and_loaded_for_playback() -> None:
    user_id = uuid4()
    profile = _profile(user_id)
    dao = FakeMusicDAO(profile)
    idp = FakeIdp(user_id)
    await CreateBeat(FakeMusicRepository(dao), dao, FakeUoW(), idp, _config())(
        CreateBeatDTO(audio_key=_key(user_id), title="Playable")
    )

    mine = await ListMyBeats(dao, idp)()
    loaded = await GetBeat(dao, idp)(GetBeatDTO(beat_id=mine[0].id))

    assert [beat.title for beat in mine] == ["Playable"]
    assert loaded.audio_url.startswith("https://tappedin.s3.eu-central-1.amazonaws.com/beats/")
    assert loaded.owner_id == user_id


def test_audio_upload_accepts_only_known_types_and_round_trips_the_key() -> None:
    user_id = uuid4()

    assert extension_for_audio("audio/mpeg", "loop.mp3") == "mp3"
    assert extension_for_audio("audio/wav", "take.wav") == "wav"
    assert extension_for_audio("audio/x-wav", "take.wav") == "wav"
    assert extension_for_audio("audio/mp4", "take.m4a") == "m4a"
    assert extension_for_audio("audio/aac", "take.aac") == "aac"
    assert extension_for_audio("audio/mpeg; charset=binary", "take.bin") == "mp3"
    with pytest.raises(InvalidMusicUploadError):
        extension_for_audio("image/jpeg", "cover.jpg")

    content_type, key = new_beat_object_key(user_id, "loop.mp3", "audio/mpeg")
    owned = require_owned_beat_key(key, user_id)
    url = _config().object_url(owned)

    assert content_type == "audio/mpeg"
    assert owned.startswith(f"beats/{user_id}/")
    assert audio_key_from_url(url) == owned
    with pytest.raises(InvalidMusicUploadError):
        require_owned_beat_key(owned, uuid4())
