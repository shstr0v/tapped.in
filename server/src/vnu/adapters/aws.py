from botocore.exceptions import BotoCoreError, ClientError

from vnu.adapters.config import AwsConfig
from vnu.application.common.file_manager import AwsFileManager
from vnu.application.dto.aws import PresignedDownloadDTO, PresignedUploadDTO, PresignedUrlDTO
from vnu.application.errors.aws import PresignedUrlError


class AwsFileManagerImpl(AwsFileManager):
    def __init__(self, client, config: AwsConfig) -> None:
        self.client = client
        self.config = config

    async def create_upload_url(self, data: PresignedUploadDTO) -> PresignedUrlDTO:
        try:
            url = self.client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.config.bucket_name,
                    "Key": data.key,
                    "ContentType": data.content_type,
                },
                ExpiresIn=data.expires_in,
            )
        except (BotoCoreError, ClientError) as exc:
            raise PresignedUrlError("Unable to create upload URL.") from exc

        return PresignedUrlDTO(url=url, key=data.key)

    async def create_download_url(self, data: PresignedDownloadDTO) -> PresignedUrlDTO:
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.config.bucket_name,
                    "Key": data.key,
                },
                ExpiresIn=data.expires_in,
            )
        except (BotoCoreError, ClientError) as exc:
            raise PresignedUrlError("Unable to create download URL.") from exc

        return PresignedUrlDTO(url=url, key=data.key)
