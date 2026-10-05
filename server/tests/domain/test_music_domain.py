from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from vnu.domain.entities.music import calculate_match_score
from vnu.domain.entities.music.entities import Connection, MusicIdentity, MusicProfile, MusicUpload, Swipe
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    MusicProfileRoleEnum,
    SwipeActionEnum,
)
from vnu.domain.entities.music.ranking import RankProfile, rank_profiles
from vnu.domain.exceptions.music import InvalidMusicInteractionError, InvalidMusicUploadError


def _profile(
    *,
    profile_id: UUID | None = None,
    location: str | None = "Bucharest",
    experience_level: ExperienceLevelEnum = ExperienceLevelEnum.INTERMEDIATE,
) -> MusicProfile:
    now = datetime.now(UTC)
    return MusicProfile(
        id=profile_id or uuid4(),
        user_id=uuid4(),
        role=MusicProfileRoleEnum.ARTIST,
        artist_name="Artist",
        location=location,
        experience_level=experience_level,
        collaboration_status=CollaborationStatusEnum.OPEN,
        created_at=now,
        updated_at=now,
    )


def test_match_score_is_deterministic_and_weighted() -> None:
    viewer = _profile()
    candidate = _profile(experience_level=ExperienceLevelEnum.ADVANCED)
    viewer_identity = MusicIdentity(
        id=uuid4(),
        profile_id=viewer.id,
        genres=["Rage", "Trap"],
        influences=["Playboi Carti", "Ken Carson"],
        type_beats=["Carti"],
    )
    candidate_identity = MusicIdentity(
        id=uuid4(),
        profile_id=candidate.id,
        genres=["rage"],
        influences=["Ken Carson"],
        type_beats=["Carti"],
    )

    first = calculate_match_score(viewer, candidate, viewer_identity, candidate_identity)
    second = calculate_match_score(viewer, candidate, viewer_identity, candidate_identity)

    assert first == second
    assert first.score == 66
    assert first.breakdown == {
        "genre_similarity": 18,
        "influences_similarity": 15,
        "type_beat_similarity": 20,
        "location_match": 10,
        "experience_proximity": 3,
    }


def test_feed_ranker_prefers_shared_taste_and_is_stable() -> None:
    viewer_id = uuid4()
    close_id = uuid4()
    far_id = uuid4()
    viewer = RankProfile(
        profile_id=viewer_id,
        role="artist",
        experience="intermediate",
        genres=["rage", "trap"],
        influences=["Ken Carson"],
        type_beats=["Carti"],
        moods=["dark"],
        location="Bucharest",
    )
    close = RankProfile(
        profile_id=close_id,
        role="producer",
        experience="advanced",
        genres=["rage"],
        influences=["Ken Carson"],
        type_beats=["Carti"],
        moods=["dark"],
        location="Bucharest",
    )
    far = RankProfile(
        profile_id=far_id,
        role="artist",
        experience="beginner",
        genres=["pop"],
        influences=["Other"],
        type_beats=["Other"],
        moods=["bright"],
        location="Tokyo",
    )

    first = rank_profiles(viewer, [far, close], [])
    second = rank_profiles(viewer, [far, close], [])

    assert [profile_id for profile_id, _ in first] == [close_id, far_id]
    assert first == second
    assert first[0][1].score > first[1][1].score
    assert "Similar genres" in first[0][1].reasons


def test_collaborative_signal_boosts_profiles_liked_by_similar_users() -> None:
    viewer_id = uuid4()
    neighbor_id = uuid4()
    liked_id = uuid4()
    suggested_id = uuid4()
    viewer = RankProfile(
        profile_id=viewer_id,
        role="artist",
        experience="intermediate",
        genres=["house"],
        influences=[],
        type_beats=[],
        moods=[],
    )
    neighbor = RankProfile(
        profile_id=neighbor_id,
        role="producer",
        experience="intermediate",
        genres=["techno"],
        influences=[],
        type_beats=[],
        moods=[],
    )
    liked = RankProfile(
        profile_id=liked_id,
        role="producer",
        experience="pro",
        genres=["jazz"],
        influences=[],
        type_beats=[],
        moods=[],
    )
    suggested = RankProfile(
        profile_id=suggested_id,
        role="producer",
        experience="pro",
        genres=["jazz"],
        influences=[],
        type_beats=[],
        moods=[],
    )

    without_likes = rank_profiles(viewer, [liked, suggested], [])
    with_likes = rank_profiles(
        viewer,
        [liked, suggested],
        [
            (viewer_id, liked_id),
            (neighbor_id, liked_id),
            (neighbor_id, suggested_id),
        ],
    )

    suggested_without = next(score for profile_id, score in without_likes if profile_id == suggested_id)
    suggested_with = next(score for profile_id, score in with_likes if profile_id == suggested_id)
    assert suggested_with.score >= suggested_without.score
    assert neighbor.profile_id != viewer.profile_id


def test_upload_requires_audio_and_title() -> None:
    profile_id = uuid4()

    with pytest.raises(InvalidMusicUploadError):
        MusicUpload.create(profile_id, "  ", "Title")
    with pytest.raises(InvalidMusicUploadError):
        MusicUpload.create(profile_id, "https://example.com/a.mp3", "   ")

    upload = MusicUpload.create_featured(
        profile_id,
        " https://example.com/a.mp3 ",
        "  Night Drive  ",
        tags=[" rage ", ""],
    )

    assert upload.is_featured is True
    assert upload.title == "Night Drive"
    assert upload.audio_url == "https://example.com/a.mp3"
    assert upload.tags == ["rage"]


def test_swipe_cannot_target_self() -> None:
    profile_id = uuid4()

    with pytest.raises(InvalidMusicInteractionError):
        Swipe.create(profile_id, profile_id, SwipeActionEnum.LIKE, 90)


def test_connection_accepts_only_pending_by_receiver() -> None:
    requester_id = uuid4()
    receiver_id = uuid4()
    connection = Connection.create_pending(requester_id, receiver_id)

    with pytest.raises(InvalidMusicInteractionError):
        connection.accept(requester_id)

    connection.accept(receiver_id)

    assert connection.status == ConnectionStatusEnum.ACCEPTED
    with pytest.raises(InvalidMusicInteractionError):
        connection.reject(receiver_id)
