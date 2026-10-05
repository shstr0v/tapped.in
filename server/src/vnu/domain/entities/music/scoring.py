from dataclasses import dataclass

from vnu.domain.entities.music.entities import MusicIdentity, MusicProfile
from vnu.domain.entities.music.enums import ExperienceLevelEnum


@dataclass(frozen=True)
class MatchScore:
    score: int
    reasons: list[str]
    breakdown: dict[str, int]


EXPERIENCE_INDEX = {
    ExperienceLevelEnum.BEGINNER: 0,
    ExperienceLevelEnum.INTERMEDIATE: 1,
    ExperienceLevelEnum.ADVANCED: 2,
    ExperienceLevelEnum.PRO: 3,
}


def _normalize(values: list[str]) -> set[str]:
    return {value.strip().lower() for value in values if value.strip()}


def _similarity(first: list[str], second: list[str]) -> float:
    first_values = _normalize(first)
    second_values = _normalize(second)
    if not first_values or not second_values:
        return 0
    return len(first_values & second_values) / max(len(first_values), len(second_values))


def _location_match(first: str | None, second: str | None) -> float:
    if not first or not second:
        return 0
    return float(first.strip().lower() == second.strip().lower())


def _experience_proximity(first: ExperienceLevelEnum, second: ExperienceLevelEnum) -> float:
    distance = abs(EXPERIENCE_INDEX[first] - EXPERIENCE_INDEX[second])
    return max(0, 1 - (distance / 3))


def calculate_match_score(
    viewer: MusicProfile,
    candidate: MusicProfile,
    viewer_identity: MusicIdentity | None,
    candidate_identity: MusicIdentity | None,
) -> MatchScore:
    viewer_identity = viewer_identity or MusicIdentity(
        id=viewer.id,
        profile_id=viewer.id,
    )
    candidate_identity = candidate_identity or MusicIdentity(
        id=candidate.id,
        profile_id=candidate.id,
    )

    genre = _similarity(viewer_identity.genres, candidate_identity.genres)
    influences = _similarity(viewer_identity.influences, candidate_identity.influences)
    type_beats = _similarity(viewer_identity.type_beats, candidate_identity.type_beats)
    location = _location_match(viewer.location, candidate.location)
    experience = _experience_proximity(viewer.experience_level, candidate.experience_level)

    weighted = {
        "genre_similarity": round(genre * 35),
        "influences_similarity": round(influences * 30),
        "type_beat_similarity": round(type_beats * 20),
        "location_match": round(location * 10),
        "experience_proximity": round(experience * 5),
    }
    score = min(100, max(0, sum(weighted.values())))
    reasons = []
    if weighted["genre_similarity"]:
        reasons.append("Similar genres")
    if weighted["influences_similarity"]:
        reasons.append("Similar influences")
    if weighted["type_beat_similarity"]:
        reasons.append("Compatible type beats")
    if weighted["location_match"]:
        reasons.append("Same location")
    if weighted["experience_proximity"]:
        reasons.append("Similar experience level")

    return MatchScore(score=score, reasons=reasons, breakdown=weighted)
