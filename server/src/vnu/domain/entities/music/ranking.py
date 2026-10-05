import math
from collections import Counter
from dataclasses import dataclass
from uuid import UUID

from vnu.domain.entities.music.scoring import MatchScore

CONTENT_WEIGHT = 0.72
COLLABORATIVE_WEIGHT = 0.28
ROLE_FIT_SAME = 0.7
ROLE_FIT_COMPLEMENT = 1.0
SCORE_CURVE = 0.65
EXPERIENCE_INDEX = {
    "beginner": 0,
    "intermediate": 1,
    "advanced": 2,
    "pro": 3,
}


@dataclass(frozen=True)
class RankProfile:
    profile_id: UUID
    role: str
    experience: str
    genres: list[str]
    influences: list[str]
    type_beats: list[str]
    moods: list[str]
    location: str | None = None
    bpm_min: int | None = None
    bpm_max: int | None = None


def rank_profiles(
    viewer: RankProfile,
    candidates: list[RankProfile],
    likes: list[tuple[UUID, UUID]],
) -> list[tuple[UUID, MatchScore]]:
    documents = [_counts(viewer), *[_counts(candidate) for candidate in candidates]]
    idf = _idf(documents)
    viewer_vector = _tfidf(documents[0], idf)
    likes_by_actor = _likes_by_actor(likes)
    viewer_likes = likes_by_actor.get(viewer.profile_id, set())

    ranked = [
        (
            candidate.profile_id,
            _score(
                viewer,
                candidate,
                content=_cosine(viewer_vector, _tfidf(documents[index + 1], idf)),
                collaborative=_collaborative(
                    candidate.profile_id,
                    viewer.profile_id,
                    viewer_likes,
                    likes_by_actor,
                ),
                use_collaborative=bool(viewer_likes),
            ),
        )
        for index, candidate in enumerate(candidates)
    ]
    return sorted(ranked, key=lambda item: (-item[1].score, str(item[0])))


def _score(
    viewer: RankProfile,
    candidate: RankProfile,
    *,
    content: float,
    collaborative: float,
    use_collaborative: bool,
) -> MatchScore:
    role_fit = ROLE_FIT_COMPLEMENT if viewer.role != candidate.role else ROLE_FIT_SAME
    content_score = content * (0.85 + 0.15 * role_fit)
    blended = (
        CONTENT_WEIGHT * content_score + COLLABORATIVE_WEIGHT * collaborative
        if use_collaborative
        else content_score
    )
    score = min(100, max(0, round(100 * (blended**SCORE_CURVE))))
    reasons = _reasons(viewer, candidate, collaborative if use_collaborative else 0)
    breakdown = _breakdown(score, content_score, role_fit if viewer.role != candidate.role else 0, collaborative)
    return MatchScore(score=score, reasons=reasons, breakdown=breakdown)


def _reasons(viewer: RankProfile, candidate: RankProfile, collaborative: float) -> list[str]:
    reasons: list[str] = []
    if _overlap(viewer.genres, candidate.genres):
        reasons.append("Similar genres")
    if _overlap(viewer.influences, candidate.influences):
        reasons.append("Similar influences")
    if _overlap(viewer.type_beats, candidate.type_beats):
        reasons.append("Compatible type beats")
    if _overlap(viewer.moods, candidate.moods):
        reasons.append("Similar mood")
    if viewer.location and candidate.location and viewer.location.strip().lower() == candidate.location.strip().lower():
        reasons.append("Same location")
    if _experience_close(viewer.experience, candidate.experience):
        reasons.append("Similar experience level")
    if viewer.role != candidate.role:
        reasons.append("Complementary role")
    if collaborative >= 0.2:
        reasons.append("People with your taste connected")
    return reasons


def _breakdown(score: int, content: float, role_fit: float, collaborative: float) -> dict[str, int]:
    weights = {
        "content_similarity": content,
        "role_fit": role_fit,
        "collaborative_filtering": collaborative,
    }
    total = sum(weights.values())
    if score == 0 or total <= 0:
        return dict.fromkeys(weights, 0)
    raw = {key: score * value / total for key, value in weights.items()}
    assigned = {key: int(value) for key, value in raw.items()}
    remainder = score - sum(assigned.values())
    for key, _ in sorted(raw.items(), key=lambda item: item[1] - assigned[item[0]], reverse=True):
        if remainder <= 0:
            break
        assigned[key] += 1
        remainder -= 1
    return assigned


def _counts(profile: RankProfile) -> Counter[str]:
    tokens = [
        *(f"genre:{_norm(value)}" for value in profile.genres),
        *(f"influence:{_norm(value)}" for value in profile.influences),
        *(f"type:{_norm(value)}" for value in profile.type_beats),
        *(f"mood:{_norm(value)}" for value in profile.moods),
    ]
    if profile.location and profile.location.strip():
        tokens.append(f"location:{_norm(profile.location)}")
    midpoint = _bpm_midpoint(profile.bpm_min, profile.bpm_max)
    if midpoint is not None:
        tokens.append(f"bpm:{(midpoint // 20) * 20}")
    return Counter(token for token in tokens if not token.endswith(":"))


def _idf(documents: list[Counter[str]]) -> dict[str, float]:
    document_count = len(documents)
    frequencies: Counter[str] = Counter()
    for document in documents:
        frequencies.update(document.keys())
    return {term: math.log((1 + document_count) / (1 + count)) + 1 for term, count in frequencies.items()}


def _tfidf(document: Counter[str], idf: dict[str, float]) -> dict[str, float]:
    total = sum(document.values()) or 1
    return {term: (count / total) * idf.get(term, 0) for term, count in document.items()}


def _cosine(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0
    shared = set(left) & set(right)
    dot = sum(left[term] * right[term] for term in shared)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm == 0 or right_norm == 0:
        return 0
    return dot / (left_norm * right_norm)


def _likes_by_actor(likes: list[tuple[UUID, UUID]]) -> dict[UUID, set[UUID]]:
    grouped: dict[UUID, set[UUID]] = {}
    for actor_id, target_id in likes:
        if actor_id != target_id:
            grouped.setdefault(actor_id, set()).add(target_id)
    return grouped


def _collaborative(
    candidate_id: UUID,
    viewer_id: UUID,
    viewer_likes: set[UUID],
    likes_by_actor: dict[UUID, set[UUID]],
) -> float:
    if not viewer_likes:
        return 0
    weighted_hits = 0.0
    weight_total = 0.0
    for actor_id, liked in likes_by_actor.items():
        if actor_id in {viewer_id, candidate_id} or not liked:
            continue
        similarity = _set_cosine(viewer_likes, liked)
        if similarity <= 0:
            continue
        weight_total += similarity
        if candidate_id in liked:
            weighted_hits += similarity
    if weight_total == 0:
        return 0
    return weighted_hits / weight_total


def _set_cosine(left: set[UUID], right: set[UUID]) -> float:
    if not left or not right:
        return 0
    shared = len(left & right)
    return shared / math.sqrt(len(left) * len(right))


def _overlap(left: list[str], right: list[str]) -> bool:
    return bool({_norm(value) for value in left if value.strip()} & {_norm(value) for value in right if value.strip()})


def _experience_close(left: str, right: str) -> bool:
    left_index = EXPERIENCE_INDEX.get(left.strip().lower())
    right_index = EXPERIENCE_INDEX.get(right.strip().lower())
    if left_index is None or right_index is None:
        return False
    return abs(left_index - right_index) <= 1


def _bpm_midpoint(bpm_min: int | None, bpm_max: int | None) -> int | None:
    if bpm_min is None and bpm_max is None:
        return None
    if bpm_min is None:
        return bpm_max
    if bpm_max is None:
        return bpm_min
    return (bpm_min + bpm_max) // 2


def _norm(value: str) -> str:
    return " ".join(value.strip().lower().split())
