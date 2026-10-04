from dataclasses import dataclass


@dataclass(frozen=True)
class PresignedUploadDTO:
    key: str
    content_type: str
    expires_in: int = 3600


@dataclass(frozen=True)
class PresignedDownloadDTO:
    key: str
    expires_in: int = 3600


@dataclass(frozen=True)
class PresignedUrlDTO:
    url: str
    key: str
