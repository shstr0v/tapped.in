from typing import Any
from uuid import UUID

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, status

from vnu.application.dto.music import GetMusicProfileDTO, UpdateMusicProfileDTO, UpsertMusicProfileDTO
from vnu.application.interactors.music import UpdateMyMusicProfile, UpsertMyMusicProfile
from vnu.application.queries.music import GetMusicProfileById, GetMyMusicProfile
from vnu.application.schemas.music import (
    UpdateMusicProfileRequest,
    UpsertMusicProfileRequest,
)

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("/me", status_code=status.HTTP_201_CREATED)
@inject
async def upsert_my_profile(
    data: UpsertMusicProfileRequest,
    interactor: FromDishka[UpsertMyMusicProfile],
) -> Any:
    return await interactor(
        UpsertMusicProfileDTO(
            role=data.role,
            artist_name=data.artist_name,
            avatar_url=data.avatar_url,
            location=data.location,
            experience_level=data.experience_level,
            bio=data.bio,
            collaboration_status=data.collaboration_status,
            identity=data.identity.to_dto() if data.identity else None,
            socials=[social.to_dto() for social in data.socials],
        )
    )


@router.get("/me")
@inject
async def get_my_profile(query: FromDishka[GetMyMusicProfile]) -> Any:
    return await query()


@router.patch("/me")
@inject
async def update_my_profile(
    data: UpdateMusicProfileRequest,
    interactor: FromDishka[UpdateMyMusicProfile],
) -> Any:
    return await interactor(
        UpdateMusicProfileDTO(
            role=data.role,
            artist_name=data.artist_name,
            avatar_url=data.avatar_url,
            location=data.location,
            experience_level=data.experience_level,
            bio=data.bio,
            collaboration_status=data.collaboration_status,
            identity=data.identity.to_dto() if data.identity else None,
            socials=[social.to_dto() for social in data.socials] if data.socials is not None else None,
        )
    )


@router.get("/{profile_id}")
@inject
async def get_profile(profile_id: UUID, query: FromDishka[GetMusicProfileById]) -> Any:
    return await query(GetMusicProfileDTO(profile_id=profile_id))
