from typing import Any

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, status

from vnu.application.dto.music import CreateFeedbackDTO
from vnu.application.interactors.music import CreateFeedback
from vnu.application.queries.music import ListReceivedFeedback
from vnu.application.schemas.music import CreateFeedbackRequest

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", status_code=status.HTTP_201_CREATED)
@inject
async def create_feedback(data: CreateFeedbackRequest, interactor: FromDishka[CreateFeedback]) -> Any:
    return await interactor(
        CreateFeedbackDTO(
            target_upload_id=data.target_upload_id,
            category=data.category,
            quick_reaction=data.quick_reaction,
            text=data.text,
        )
    )


@router.get("/me")
@inject
async def list_received_feedback(query: FromDishka[ListReceivedFeedback]) -> Any:
    return await query()
