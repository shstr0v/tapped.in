from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from vnu.application.dto.music import (
    CreateFeaturedUploadDTO,
    MusicIdentityDTO,
    MusicProfileDTO,
    MusicUploadDTO,
    RecommendationFiltersDTO,
    SwipeInputDTO,
)
from vnu.application.interactors.music import CreateFeaturedUpload, SwipeProfile
from vnu.application.queries.music import GetRecommendationFeed
from vnu.domain.entities.music.entities import Connection, MusicUpload, Notification, Swipe
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    MusicProfileRoleEnum,
    SwipeActionEnum,
)
from vnu.domain.entities.user.value_objects import UserId


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

    async def rollback(self) -> None:
        return None

    async def flush(self) -> None:
        return None


class FakeMusicDAO:
    def __init__(self, current_user_id: UUID, profiles: list[MusicProfileDTO]) -> None:
        self.current_user_id = current_user_id
        self.profiles = {profile.id: profile for profile in profiles}
        self.uploads: dict[UUID, MusicUploadDTO] = {}
        self.swipes: dict[tuple[UUID, UUID], SwipeActionEnum] = {}

    async def get_profile_by_user_id(self, user_id: UUID) -> MusicProfileDTO | None:
        return next((profile for profile in self.profiles.values() if profile.user_id == user_id), None)

    async def get_profile_by_id(self, profile_id: UUID) -> MusicProfileDTO | None:
        return self.profiles.get(profile_id)

    async def get_swipe_action(self, actor_profile_id: UUID, target_profile_id: UUID) -> SwipeActionEnum | None:
        return self.swipes.get((actor_profile_id, target_profile_id))

    async def get_upload(self, upload_id: UUID) -> MusicUploadDTO | None:
        return self.uploads.get(upload_id)

    async def list_uploads(self, profile_id: UUID) -> list[MusicUploadDTO]:
        return [upload for upload in self.uploads.values() if upload.profile_id == profile_id]

    async def list_recommendation_candidates(
        self,
        viewer_profile_id: UUID,
        filters: RecommendationFiltersDTO,
    ) -> list[MusicProfileDTO]:
        return [
            profile
            for profile in self.profiles.values()
            if profile.id != viewer_profile_id and profile.featured_upload is not None
        ]


class FakeMusicRepository:
    def __init__(self, dao: FakeMusicDAO) -> None:
        self.dao = dao
        self.connections: dict[frozenset[UUID], Connection] = {}
        self.notifications: list[Notification] = []

    async def replace_featured_upload(self, upload: MusicUpload) -> MusicUploadDTO:
        for upload_id, existing_upload in list(self.dao.uploads.items()):
            if existing_upload.profile_id == upload.profile_id:
                del self.dao.uploads[upload_id]
        dto = MusicUploadDTO(
            id=upload.id,
            profile_id=upload.profile_id,
            audio_url=upload.audio_url,
            title=upload.title,
            genre=upload.genre,
            tags=upload.tags,
            bpm=upload.bpm,
            description=upload.description,
            is_featured=upload.is_featured,
            created_at=upload.created_at,
        )
        self.dao.uploads[dto.id] = dto
        return dto

    async def save_swipe(self, swipe: Swipe) -> None:
        self.dao.swipes[(swipe.actor_profile_id, swipe.target_profile_id)] = swipe.action

    async def get_connection_between(self, first_profile_id: UUID, second_profile_id: UUID) -> Connection | None:
        return self.connections.get(frozenset((first_profile_id, second_profile_id)))

    async def save_connection(self, connection: Connection) -> Connection:
        self.connections[frozenset((connection.requester_profile_id, connection.receiver_profile_id))] = connection
        return connection

    async def save_notification(self, notification: Notification) -> Notification:
        self.notifications.append(notification)
        return notification


def _profile(
    user_id: UUID | None = None,
    *,
    artist_name: str = "Artist",
    identity: MusicIdentityDTO | None = None,
    featured_upload: MusicUploadDTO | None = None,
) -> MusicProfileDTO:
    now = datetime.now(UTC)
    return MusicProfileDTO(
        id=uuid4(),
        user_id=user_id or uuid4(),
        role=MusicProfileRoleEnum.ARTIST,
        artist_name=artist_name,
        avatar_url="https://example.com/avatar.jpg",
        location="Bucharest",
        experience_level=ExperienceLevelEnum.INTERMEDIATE,
        collaboration_status=CollaborationStatusEnum.OPEN,
        created_at=now,
        updated_at=now,
        identity=identity,
        featured_upload=featured_upload,
    )


def _identity(*, genres: list[str], influences: list[str], type_beats: list[str]) -> MusicIdentityDTO:
    return MusicIdentityDTO(
        genres=genres,
        influences=influences,
        type_beats=type_beats,
        moods=[],
    )


def _upload(profile_id: UUID, *, title: str, tags: list[str]) -> MusicUploadDTO:
    return MusicUploadDTO(
        id=uuid4(),
        profile_id=profile_id,
        audio_url=f"https://example.com/{title}.mp3",
        title=title,
        genre=tags[0] if tags else None,
        tags=tags,
        is_featured=True,
        created_at=datetime.now(UTC),
    )


@pytest.mark.asyncio
async def test_featured_upload_replace_keeps_one_upload() -> None:
    user_id = uuid4()
    profile = _profile(user_id)
    dao = FakeMusicDAO(user_id, [profile])
    repository = FakeMusicRepository(dao)
    uow = FakeUoW()
    interactor = CreateFeaturedUpload(repository, dao, uow, FakeIdp(user_id))

    first = await interactor(CreateFeaturedUploadDTO(audio_url="https://example.com/one.mp3", title="One"))
    second = await interactor(CreateFeaturedUploadDTO(audio_url="https://example.com/two.mp3", title="Two"))

    assert first.id != second.id
    assert [upload.title for upload in dao.uploads.values()] == ["Two"]
    assert uow.commits == 2


@pytest.mark.asyncio
async def test_reciprocal_like_accepts_connection_and_notifies_both_users() -> None:
    user_id = uuid4()
    actor = _profile(user_id)
    target = _profile()
    dao = FakeMusicDAO(user_id, [actor, target])
    repository = FakeMusicRepository(dao)
    repository.connections[frozenset((actor.id, target.id))] = Connection.create_pending(target.id, actor.id)
    uow = FakeUoW()
    interactor = SwipeProfile(repository, dao, uow, FakeIdp(user_id))

    await interactor(SwipeInputDTO(target_profile_id=target.id, action=SwipeActionEnum.LIKE))

    connection = repository.connections[frozenset((actor.id, target.id))]
    assert connection.status == ConnectionStatusEnum.ACCEPTED
    assert len(repository.notifications) == 2
    assert uow.commits == 1


@pytest.mark.asyncio
async def test_recommendation_feed_returns_mobile_card_shape_sorted_by_score() -> None:
    user_id = uuid4()
    viewer = _profile(
        user_id,
        identity=_identity(genres=["rage", "trap"], influences=["Ken Carson"], type_beats=["Carti"]),
    )
    strong = _profile(
        artist_name="800pts",
        identity=_identity(genres=["rage"], influences=["Ken Carson"], type_beats=["Carti"]),
    )
    strong = _profile(
        strong.user_id,
        artist_name=strong.artist_name,
        identity=strong.identity,
        featured_upload=_upload(strong.id, title="rage-preview", tags=["hip-hop", "rage"]),
    )
    weak = _profile(
        artist_name="Other",
        identity=_identity(genres=["pop"], influences=["Other"], type_beats=["Other"]),
    )
    weak = _profile(
        weak.user_id,
        artist_name=weak.artist_name,
        identity=weak.identity,
        featured_upload=_upload(weak.id, title="pop-preview", tags=["pop"]),
    )
    dao = FakeMusicDAO(user_id, [viewer, weak, strong])
    query = GetRecommendationFeed(dao, FakeIdp(user_id))

    cards = await query(RecommendationFiltersDTO(limit=1))

    assert len(cards) == 1
    card = cards[0]
    assert card.profile.image_url == "https://example.com/avatar.jpg"
    assert card.profile.user_account.name == "800pts"
    assert card.profile.user_account.role == MusicProfileRoleEnum.ARTIST
    assert card.profile.user_account.location == "Bucharest"
    assert "rage" in {tag.lower() for tag in card.profile.user_account.tags}
    assert card.profile.preview_beat.audio_url.endswith("rage-preview.mp3")
    assert card.match.score > 0
