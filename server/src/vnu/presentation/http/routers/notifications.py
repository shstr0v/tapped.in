from typing import Any
from uuid import UUID

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter

from vnu.application.dto.music import MarkNotificationReadDTO
from vnu.application.interactors.music import MarkNotificationRead
from vnu.application.queries.music import ListNotifications

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
@inject
async def list_notifications(query: FromDishka[ListNotifications]) -> Any:
    return await query()


@router.post("/{notification_id}/read")
@inject
async def mark_notification_read(notification_id: UUID, interactor: FromDishka[MarkNotificationRead]) -> Any:
    return await interactor(MarkNotificationReadDTO(notification_id=notification_id))
