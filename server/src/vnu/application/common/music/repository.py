from abc import abstractmethod
from datetime import datetime
from typing import Protocol
from uuid import UUID

from vnu.application.dto.music import (
    ConnectionDTO,
    FeedbackDTO,
    MusicIdentityInputDTO,
    MusicProfileDTO,
    MusicUploadDTO,
    NotificationDTO,
    SocialLinkInputDTO,
)
from vnu.domain.entities.music.entities import (
    Connection,
    Conversation,
    Feedback,
    Message,
    MusicProfile,
    MusicUpload,
    Notification,
    Swipe,
)


class MusicRepository(Protocol):
    @abstractmethod
    async def save_profile(
        self,
        profile: MusicProfile,
        identity: MusicIdentityInputDTO | None,
        socials: list[SocialLinkInputDTO],
    ) -> MusicProfileDTO:
        raise NotImplementedError

    @abstractmethod
    async def update_profile(
        self,
        profile: MusicProfile,
        identity: MusicIdentityInputDTO | None,
        socials: list[SocialLinkInputDTO] | None,
    ) -> MusicProfileDTO:
        raise NotImplementedError

    @abstractmethod
    async def get_profile_entity_by_user_id(self, user_id: UUID) -> MusicProfile | None:
        raise NotImplementedError

    @abstractmethod
    async def get_profile_entity_by_id(self, profile_id: UUID) -> MusicProfile | None:
        raise NotImplementedError

    @abstractmethod
    async def replace_featured_upload(self, upload: MusicUpload) -> MusicUploadDTO:
        raise NotImplementedError

    @abstractmethod
    async def delete_upload(self, upload_id: UUID, profile_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def save_swipe(self, swipe: Swipe) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_connection_between(self, first_profile_id: UUID, second_profile_id: UUID) -> Connection | None:
        raise NotImplementedError

    @abstractmethod
    async def save_connection(self, connection: Connection) -> ConnectionDTO:
        raise NotImplementedError

    @abstractmethod
    async def get_connection(self, connection_id: UUID) -> Connection | None:
        raise NotImplementedError

    @abstractmethod
    async def save_feedback(self, feedback: Feedback) -> FeedbackDTO:
        raise NotImplementedError

    @abstractmethod
    async def save_notification(self, notification: Notification) -> NotificationDTO:
        raise NotImplementedError

    @abstractmethod
    async def mark_notification_read(self, notification_id: UUID, user_id: UUID) -> NotificationDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def get_conversation(self, conversation_id: UUID) -> Conversation | None:
        raise NotImplementedError

    @abstractmethod
    async def get_conversation_between_users(self, first_user_id: UUID, second_user_id: UUID) -> Conversation | None:
        raise NotImplementedError

    @abstractmethod
    async def save_conversation(self, conversation: Conversation) -> Conversation:
        raise NotImplementedError

    @abstractmethod
    async def save_message(self, message: Message) -> None:
        raise NotImplementedError

    @abstractmethod
    async def mark_conversation_read(self, conversation_id: UUID, reader_user_id: UUID, read_at: datetime) -> None:
        raise NotImplementedError
