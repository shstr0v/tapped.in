from typing import Any
from uuid import UUID, uuid4

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, status

from vnu.adapters.auth.idp import SessionIdProvider
from vnu.adapters.config import AwsConfig
from vnu.application.common.file_manager import AwsFileManager
from vnu.application.dto.aws import PresignedUploadDTO
from vnu.application.dto.music import CreateFeaturedUploadDTO, DeleteUploadDTO
from vnu.application.interactors.music import CreateFeaturedUpload, DeleteUpload
from vnu.application.interactors.music.beat_audio import is_beat_upload, new_beat_object_key
from vnu.application.interactors.music.common import current_user_id
from vnu.application.queries.music import ListMyUploads
from vnu.application.schemas.music import (
    CreateFeaturedUploadRequest,
    CreatePresignedUploadRequest,
    PresignedUploadResponse,
)
from vnu.domain.exceptions.music import InvalidMusicUploadError

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/presigned-url")
@router.post("/presigned")
@inject
async def create_presigned_upload_url(
    data: CreatePresignedUploadRequest,
    file_manager: FromDishka[AwsFileManager],
    config: FromDishka[AwsConfig],
    idp: FromDishka[SessionIdProvider],
) -> PresignedUploadResponse:
    if is_beat_upload(data.upload_type):
        user_id = await current_user_id(idp)
        content_type, key = new_beat_object_key(user_id, data.file_name, data.content_type)
    else:
        extension = data.file_name.rsplit(".", 1)[-1] if "." in data.file_name else "bin"
        content_type = data.content_type
        folder = data.folder.strip("/")
        if not folder or folder == "beats" or folder.startswith("beats/"):
            raise InvalidMusicUploadError("Use upload_type=beat for audio uploads.")
        key = f"{folder}/{uuid4()}.{extension}"
    presigned = await file_manager.create_upload_url(
        PresignedUploadDTO(key=key, content_type=content_type)
    )
    return PresignedUploadResponse(
        file_url=config.object_url(key),
        key=presigned.key,
        upload_url=presigned.url,
    )


@router.post("/featured", status_code=status.HTTP_201_CREATED)
@inject
async def create_featured_upload(
    data: CreateFeaturedUploadRequest,
    interactor: FromDishka[CreateFeaturedUpload],
) -> Any:
    return await interactor(
        CreateFeaturedUploadDTO(
            audio_url=data.audio_url,
            title=data.title,
            genre=data.genre,
            tags=data.tags,
            bpm=data.bpm,
            description=data.description,
        )
    )


@router.get("/me")
@inject
async def list_my_uploads(query: FromDishka[ListMyUploads]) -> Any:
    return await query()


@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
@inject
async def delete_upload(upload_id: UUID, interactor: FromDishka[DeleteUpload]) -> None:
    await interactor(DeleteUploadDTO(upload_id=upload_id))
