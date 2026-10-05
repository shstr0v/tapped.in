from typing import Any
from uuid import UUID
from uuid import uuid4

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, status

from vnu.adapters.config import AwsConfig
from vnu.application.common.file_manager import AwsFileManager
from vnu.application.dto.aws import PresignedUploadDTO
from vnu.application.dto.music import CreateFeaturedUploadDTO, DeleteUploadDTO
from vnu.application.interactors.music import CreateFeaturedUpload, DeleteUpload
from vnu.application.queries.music import ListMyUploads
from vnu.application.schemas.music import CreateFeaturedUploadRequest, CreatePresignedUploadRequest, PresignedUploadResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])


def _public_s3_url(config: AwsConfig, key: str) -> str:
    region = f".s3.{config.region}" if config.region else ".s3"
    return f"https://{config.bucket_name}{region}.amazonaws.com/{key}"


@router.post("/presigned-url")
@inject
async def create_presigned_upload_url(
    data: CreatePresignedUploadRequest,
    file_manager: FromDishka[AwsFileManager],
    config: FromDishka[AwsConfig],
) -> PresignedUploadResponse:
    extension = data.file_name.rsplit(".", 1)[-1] if "." in data.file_name else "bin"
    key = f"{data.folder.strip('/')}/{uuid4()}.{extension}"
    presigned = await file_manager.create_upload_url(
        PresignedUploadDTO(key=key, content_type=data.content_type)
    )
    return PresignedUploadResponse(
        file_url=_public_s3_url(config, key),
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
