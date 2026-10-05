from datetime import datetime
from typing import Any
from uuid import UUID

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, status

from vnu.application.dto.music import ListMessagesDTO, MarkConversationReadDTO, OpenConversationDTO
from vnu.application.interactors.music import MarkConversationRead, OpenConversation, SendMessage
from vnu.application.queries.music import ListConversations, ListMessages
from vnu.application.schemas.music import SendMessageRequest

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("")
@inject
async def list_conversations(query: FromDishka[ListConversations]) -> Any:
    return await query()


@router.post("/{user_id}")
@inject
async def open_conversation(user_id: UUID, interactor: FromDishka[OpenConversation]) -> Any:
    return await interactor(OpenConversationDTO(user_id=user_id))


@router.get("/{conversation_id}/messages")
@inject
async def list_messages(
    conversation_id: UUID,
    query: FromDishka[ListMessages],
    limit: int = 50,
    before: datetime | None = None,
) -> Any:
    return await query(ListMessagesDTO(conversation_id=conversation_id, limit=limit, before=before))


@router.post("/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
@inject
async def send_message(
    conversation_id: UUID,
    data: SendMessageRequest,
    interactor: FromDishka[SendMessage],
) -> Any:
    return await interactor(data.to_dto(conversation_id))


@router.post("/{conversation_id}/read")
@inject
async def mark_conversation_read(
    conversation_id: UUID,
    interactor: FromDishka[MarkConversationRead],
) -> Any:
    return await interactor(MarkConversationReadDTO(conversation_id=conversation_id))
