from abc import abstractmethod
from datetime import datetime
from typing import Protocol
from uuid import UUID

from vnu.application.dto.music import (
    ConnectionDTO,
    ConversationSummaryDTO,
    FeedbackDTO,
    MessageDTO,
    MusicProfileDTO,
    MusicUploadDTO,
    NotificationDTO,
    RecommendationFiltersDTO,
)
from vnu.domain.entities.music.enums import SwipeActionEnum


class MusicDAO(Protocol):
    @abstractmethod
    async def get_profile_by_user_id(self, user_id: UUID) -> MusicProfileDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def get_profile_by_id(self, profile_id: UUID) -> MusicProfileDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def list_uploads(self, profile_id: UUID) -> list[MusicUploadDTO]:
        raise NotImplementedError

    @abstractmethod
    async def get_upload(self, upload_id: UUID) -> MusicUploadDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def list_recommendation_candidates(
        self,
        viewer_profile_id: UUID,
        filters: RecommendationFiltersDTO,
    ) -> list[MusicProfileDTO]:
        raise NotImplementedError

    @abstractmethod
    async def list_like_edges(self) -> list[tuple[UUID, UUID]]:
        raise NotImplementedError

    @abstractmethod
    async def get_swipe_action(self, actor_profile_id: UUID, target_profile_id: UUID) -> SwipeActionEnum | None:
        raise NotImplementedError

    @abstractmethod
    async def list_saved_profiles(self, profile_id: UUID) -> list[MusicProfileDTO]:
        raise NotImplementedError

    @abstractmethod
    async def list_connections(self, profile_id: UUID) -> list[ConnectionDTO]:
        raise NotImplementedError

    @abstractmethod
    async def list_received_feedback(self, profile_id: UUID) -> list[FeedbackDTO]:
        raise NotImplementedError

    @abstractmethod
    async def list_notifications(self, user_id: UUID) -> list[NotificationDTO]:
        raise NotImplementedError

    @abstractmethod
    async def list_conversation_summaries(self, user_id: UUID) -> list[ConversationSummaryDTO]:
        raise NotImplementedError

    @abstractmethod
    async def get_conversation_summary(self, conversation_id: UUID, user_id: UUID) -> ConversationSummaryDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def list_messages(
        self,
        conversation_id: UUID,
        *,
        limit: int,
        before: datetime | None,
    ) -> list[MessageDTO]:
        raise NotImplementedError

    @abstractmethod
    async def get_message(self, message_id: UUID) -> MessageDTO | None:
        raise NotImplementedError
