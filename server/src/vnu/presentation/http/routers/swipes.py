from typing import Any

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter

from vnu.application.dto.music import SwipeInputDTO
from vnu.application.interactors.music import SwipeProfile
from vnu.application.queries.music import ListSavedProfiles
from vnu.application.schemas.music import SwipeRequest

router = APIRouter(prefix="/swipes", tags=["swipes"])


@router.post("")
@inject
async def swipe_profile(data: SwipeRequest, interactor: FromDishka[SwipeProfile]) -> Any:
    return await interactor(SwipeInputDTO(target_profile_id=data.target_profile_id, action=data.action))


@router.get("/saved")
@inject
async def list_saved_profiles(query: FromDishka[ListSavedProfiles]) -> Any:
    return await query()
