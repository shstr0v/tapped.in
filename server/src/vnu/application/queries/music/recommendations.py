from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.query import Query
from vnu.application.dto.music import (
    FeedPreviewBeatDTO,
    FeedProfileDTO,
    FeedUserAccountDTO,
    GetMusicProfileDTO,
    MatchScoreDTO,
    MusicProfileDTO,
    RecommendationCardDTO,
    RecommendationFiltersDTO,
)
from vnu.application.errors.music import MusicProfileNotFoundError
from vnu.application.interactors.music.common import current_profile
from vnu.domain.entities.music.ranking import RankProfile, rank_profiles


class GetRecommendationFeed(Query[RecommendationFiltersDTO, list[RecommendationCardDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self, data: RecommendationFiltersDTO) -> list[RecommendationCardDTO]:
        profile = await current_profile(self.dao, self.idp)
        candidates = await self.dao.list_recommendation_candidates(profile.id, data)
        candidates = [candidate for candidate in candidates if self._matches_filters(candidate, data)]
        ranked = dict(
            rank_profiles(
                _features(profile),
                [_features(candidate) for candidate in candidates],
                await self.dao.list_like_edges(),
            )
        )
        cards = [
            RecommendationCardDTO(
                profile=self._to_feed_profile(candidate),
                match=MatchScoreDTO(
                    score=ranked[candidate.id].score,
                    reasons=ranked[candidate.id].reasons,
                    breakdown=ranked[candidate.id].breakdown,
                ),
            )
            for candidate in candidates
            if candidate.id in ranked
        ]
        return sorted(cards, key=lambda card: (-card.match.score, str(card.profile.id)))[: data.limit]

    def _matches_filters(self, profile: MusicProfileDTO, filters: RecommendationFiltersDTO) -> bool:
        if filters.genre is None:
            return True
        genres = profile.identity.genres if profile.identity else []
        return filters.genre.strip().lower() in {genre.strip().lower() for genre in genres}

    def _to_feed_profile(self, profile: MusicProfileDTO) -> FeedProfileDTO:
        if profile.featured_upload is None:
            raise MusicProfileNotFoundError("Recommended profile has no preview beat.")
        tags = self._tags_for(profile)
        return FeedProfileDTO(
            id=profile.id,
            image_url=profile.avatar_url,
            user_account=FeedUserAccountDTO(
                id=profile.user_id,
                profile_id=profile.id,
                name=profile.artist_name,
                avatar_url=profile.avatar_url,
                tags=tags,
                role=profile.role,
                location=profile.location,
                experience_level=profile.experience_level,
                bio=profile.bio,
                collaboration_status=profile.collaboration_status,
            ),
            preview_beat=FeedPreviewBeatDTO(
                id=profile.featured_upload.id,
                title=profile.featured_upload.title,
                audio_url=profile.featured_upload.audio_url,
                genre=profile.featured_upload.genre,
                tags=profile.featured_upload.tags,
                bpm=profile.featured_upload.bpm,
                description=profile.featured_upload.description,
            ),
        )

    def _tags_for(self, profile: MusicProfileDTO) -> list[str]:
        if profile.identity is None:
            return profile.featured_upload.tags if profile.featured_upload else []
        values = [
            *profile.identity.genres,
            *profile.identity.type_beats,
            *profile.identity.influences,
            *(profile.featured_upload.tags if profile.featured_upload else []),
        ]
        tags = []
        seen = set()
        for value in values:
            normalized = value.strip().lower()
            if normalized and normalized not in seen:
                seen.add(normalized)
                tags.append(value)
        return tags[:8]


class GetRecommendationScore(Query[GetMusicProfileDTO, MatchScoreDTO]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self, data: GetMusicProfileDTO) -> MatchScoreDTO:
        profile = await current_profile(self.dao, self.idp)
        target = await self.dao.get_profile_by_id(data.profile_id)
        if target is None:
            raise MusicProfileNotFoundError("Music profile not found.")
        ranked = rank_profiles(_features(profile), [_features(target)], await self.dao.list_like_edges())
        match = ranked[0][1] if ranked else None
        if match is None:
            raise MusicProfileNotFoundError("Music profile not found.")
        return MatchScoreDTO(score=match.score, reasons=match.reasons, breakdown=match.breakdown)


def _features(profile: MusicProfileDTO) -> RankProfile:
    identity = profile.identity
    return RankProfile(
        profile_id=profile.id,
        role=profile.role.value,
        experience=profile.experience_level.value,
        genres=list(identity.genres) if identity else [],
        influences=list(identity.influences) if identity else [],
        type_beats=list(identity.type_beats) if identity else [],
        moods=list(identity.moods) if identity else [],
        location=profile.location,
        bpm_min=identity.bpm_min if identity else None,
        bpm_max=identity.bpm_max if identity else None,
    )
