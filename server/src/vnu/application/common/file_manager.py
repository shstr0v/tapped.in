from abc import abstractmethod
from typing import Protocol

from vnu.application.dto.aws import PresignedDownloadDTO, PresignedUploadDTO, PresignedUrlDTO


class AwsFileManager(Protocol):
    @abstractmethod
    async def create_upload_url(self, data: PresignedUploadDTO) -> PresignedUrlDTO:
        raise NotImplementedError

    @abstractmethod
    async def create_download_url(self, data: PresignedDownloadDTO) -> PresignedUrlDTO:
        raise NotImplementedError
