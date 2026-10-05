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
from vnu.application.interactors.music.common import current_profile, match_score_for


class GetRecommendationFeed(Query[RecommendationFiltersDTO, list[RecommendationCardDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self, data: RecommendationFiltersDTO) -> list[RecommendationCardDTO]:
        profile = await current_profile(self.dao, self.idp)
        candidates = await self.dao.list_recommendation_candidates(profile.id, data)
        candidates = [candidate for candidate in candidates if self._matches_filters(candidate, data)]
        cards = [
            RecommendationCardDTO(
                profile=self._to_feed_profile(candidate),
                match=MatchScoreDTO(
                    score=(match := match_score_for(profile, candidate)).score,
                    reasons=match.reasons,
                    breakdown=match.breakdown,
                ),
            )
            for candidate in candidates
        ]
        return sorted(cards, key=lambda card: card.match.score, reverse=True)[: data.limit]

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
        match = match_score_for(profile, target)
        return MatchScoreDTO(score=match.score, reasons=match.reasons, breakdown=match.breakdown)
