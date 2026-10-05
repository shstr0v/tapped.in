from typing import Annotated, Any
from uuid import UUID

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, Query

from vnu.application.dto.music import GetMusicProfileDTO, RecommendationFiltersDTO, SwipeInputDTO
from vnu.application.interactors.music import SwipeProfile
from vnu.application.queries.music import GetRecommendationFeed, GetRecommendationScore
from vnu.domain.entities.music.enums import MusicProfileRoleEnum, SwipeActionEnum

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/feed")
@inject
async def get_recommendation_feed(
    query: FromDishka[GetRecommendationFeed],
    role: MusicProfileRoleEnum | None = None,
    genre: str | None = None,
    location: str | None = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> Any:
    return await query(RecommendationFiltersDTO(role=role, genre=genre, location=location, limit=limit))


@router.get("/{profile_id}/score")
@inject
async def get_recommendation_score(profile_id: UUID, query: FromDishka[GetRecommendationScore]) -> Any:
    return await query(GetMusicProfileDTO(profile_id=profile_id))


@router.post("/{profile_id}/send-request")
@inject
async def send_recommendation_request(profile_id: UUID, interactor: FromDishka[SwipeProfile]) -> Any:
    return await interactor(SwipeInputDTO(target_profile_id=profile_id, action=SwipeActionEnum.LIKE))


@router.post("/{profile_id}/decline")
@inject
async def decline_recommendation(profile_id: UUID, interactor: FromDishka[SwipeProfile]) -> Any:
    return await interactor(SwipeInputDTO(target_profile_id=profile_id, action=SwipeActionEnum.SKIP))
