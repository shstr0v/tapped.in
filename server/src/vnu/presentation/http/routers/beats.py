from typing import Any
from uuid import UUID

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, status

from vnu.application.dto.music import CreateBeatDTO, GetBeatDTO
from vnu.application.interactors.music import CreateBeat
from vnu.application.queries.music import GetBeat, ListMyBeats
from vnu.application.schemas.music import CreateBeatRequest

router = APIRouter(prefix="/beats", tags=["beats"])


@router.post("", status_code=status.HTTP_201_CREATED)
@inject
async def create_beat(data: CreateBeatRequest, interactor: FromDishka[CreateBeat]) -> Any:
    return await interactor(
        CreateBeatDTO(
            audio_key=data.audio_key,
            title=data.title,
            genre=data.genre,
            tags=data.tags,
            bpm=data.bpm,
            description=data.description,
        )
    )


@router.get("/me")
@inject
async def list_my_beats(query: FromDishka[ListMyBeats]) -> Any:
    return await query()


@router.get("/{beat_id}")
@inject
async def get_beat(beat_id: UUID, query: FromDishka[GetBeat]) -> Any:
    return await query(GetBeatDTO(beat_id=beat_id))
