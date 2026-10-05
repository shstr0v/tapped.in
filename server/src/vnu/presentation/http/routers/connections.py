from typing import Any
from uuid import UUID

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter

from vnu.application.dto.music import ConnectionActionDTO, ConnectionProfileDTO
from vnu.application.interactors.music import AcceptConnection, RejectConnection, RequestConnection
from vnu.application.queries.music import ListConnections

router = APIRouter(prefix="/connections", tags=["connections"])


@router.get("")
@inject
async def list_connections(query: FromDishka[ListConnections]) -> Any:
    return await query()


@router.post("/{profile_id}/request")
@inject
async def request_connection(profile_id: UUID, interactor: FromDishka[RequestConnection]) -> Any:
    return await interactor(ConnectionProfileDTO(profile_id=profile_id))


@router.post("/{connection_id}/accept")
@inject
async def accept_connection(connection_id: UUID, interactor: FromDishka[AcceptConnection]) -> Any:
    return await interactor(ConnectionActionDTO(connection_id=connection_id))


@router.post("/{connection_id}/reject")
@inject
async def reject_connection(connection_id: UUID, interactor: FromDishka[RejectConnection]) -> Any:
    return await interactor(ConnectionActionDTO(connection_id=connection_id))
