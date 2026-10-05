from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from vnu.domain.entities.music import calculate_match_score
from vnu.domain.entities.music.entities import Connection, MusicIdentity, MusicProfile, Swipe
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    MusicProfileRoleEnum,
    SwipeActionEnum,
)
from vnu.domain.exceptions.music import InvalidMusicInteractionError


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
