from datetime import datetime
from uuid import UUID

from sqlalchemy import exists, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from vnu.adapters.data.models import (
    ConnectionModel,
    ConversationModel,
    FeedbackModel,
    MessageModel,
    MusicIdentityModel,
    MusicProfileModel,
    MusicUploadModel,
    NotificationModel,
    SocialLinkModel,
    SwipeModel,
)
from vnu.application.common.music.dao import MusicDAO
from vnu.application.dto.music import (
    BeatPreviewDTO,
    ChatUserDTO,
    ConnectionDTO,
    ConversationSummaryDTO,
    FeedbackDTO,
    MessageDTO,
    MusicIdentityDTO,
    MusicProfileDTO,
    MusicUploadDTO,
    NotificationDTO,
    RecommendationFiltersDTO,
    SocialLinkDTO,
)
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    FeedbackCategoryEnum,
    MessageTypeEnum,
    MusicProfileRoleEnum,
    NotificationTypeEnum,
    SocialPlatformEnum,
    SwipeActionEnum,
)


def _chat_user(profile: MusicProfileModel | None, user_id: UUID) -> ChatUserDTO:
    if profile is None:
        return ChatUserDTO(user_id=user_id, artist_name="")
    return ChatUserDTO(
        user_id=profile.user_id,
        profile_id=profile.id,
        artist_name=profile.artist_name,
        avatar_url=profile.avatar_url,
        role=MusicProfileRoleEnum(profile.role),
    )


class MusicDAOImpl(MusicDAO):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_profile_by_user_id(self, user_id: UUID) -> MusicProfileDTO | None:
        result = await self.session.execute(select(MusicProfileModel).where(MusicProfileModel.user_id == user_id))
        profile = result.scalar_one_or_none()
        return await self._to_profile_dto(profile) if profile else None

    async def get_profile_by_id(self, profile_id: UUID) -> MusicProfileDTO | None:
        result = await self.session.execute(select(MusicProfileModel).where(MusicProfileModel.id == profile_id))
        profile = result.scalar_one_or_none()
        return await self._to_profile_dto(profile) if profile else None

    async def list_uploads(self, profile_id: UUID) -> list[MusicUploadDTO]:
        result = await self.session.execute(
            select(MusicUploadModel)
            .where(MusicUploadModel.profile_id == profile_id)
            .order_by(MusicUploadModel.created_at.desc())
        )
        return [self._to_upload_dto(upload) for upload in result.scalars().all()]

    async def get_upload(self, upload_id: UUID) -> MusicUploadDTO | None:
        result = await self.session.execute(select(MusicUploadModel).where(MusicUploadModel.id == upload_id))
        upload = result.scalar_one_or_none()
        return self._to_upload_dto(upload) if upload else None

    async def list_recommendation_candidates(
        self,
        viewer_profile_id: UUID,
        filters: RecommendationFiltersDTO,
    ) -> list[MusicProfileDTO]:
        already_swiped = exists().where(
            SwipeModel.actor_profile_id == viewer_profile_id,
            SwipeModel.target_profile_id == MusicProfileModel.id,
        )
        has_featured_upload = exists().where(
            MusicUploadModel.profile_id == MusicProfileModel.id,
            MusicUploadModel.is_featured.is_(True),
        )
        query = select(MusicProfileModel).where(
            MusicProfileModel.id != viewer_profile_id,
            has_featured_upload,
            ~already_swiped,
        )
        if filters.role is not None:
            query = query.where(MusicProfileModel.role == filters.role.value)
        if filters.location:
            query = query.where(MusicProfileModel.location == filters.location)
        candidate_pool_limit = max(50, min(filters.limit * 10, 200))
        query = query.order_by(MusicProfileModel.created_at.desc()).limit(candidate_pool_limit)
        result = await self.session.execute(query)
        return [await self._to_profile_dto(profile) for profile in result.scalars().all()]

    async def list_like_edges(self) -> list[tuple[UUID, UUID]]:
        result = await self.session.execute(
            select(SwipeModel.actor_profile_id, SwipeModel.target_profile_id).where(
                SwipeModel.action.in_((SwipeActionEnum.LIKE.value, SwipeActionEnum.SAVE.value))
            )
        )
        return [(actor_id, target_id) for actor_id, target_id in result.all()]

    async def get_swipe_action(self, actor_profile_id: UUID, target_profile_id: UUID) -> SwipeActionEnum | None:
        result = await self.session.execute(
            select(SwipeModel.action).where(
                SwipeModel.actor_profile_id == actor_profile_id,
                SwipeModel.target_profile_id == target_profile_id,
            )
        )
        action = result.scalar_one_or_none()
        return SwipeActionEnum(action) if action else None

    async def list_saved_profiles(self, profile_id: UUID) -> list[MusicProfileDTO]:
        result = await self.session.execute(
            select(MusicProfileModel)
            .join(SwipeModel, SwipeModel.target_profile_id == MusicProfileModel.id)
            .where(
                SwipeModel.actor_profile_id == profile_id,
                SwipeModel.action == SwipeActionEnum.SAVE.value,
            )
            .order_by(SwipeModel.created_at.desc())
        )
        return [await self._to_profile_dto(profile) for profile in result.scalars().all()]

    async def list_connections(self, profile_id: UUID) -> list[ConnectionDTO]:
        result = await self.session.execute(
            select(ConnectionModel)
            .where(
                or_(
                    ConnectionModel.requester_profile_id == profile_id,
                    ConnectionModel.receiver_profile_id == profile_id,
                )
            )
            .order_by(ConnectionModel.updated_at.desc())
        )
        return [await self._to_connection_dto(connection) for connection in result.scalars().all()]

    async def list_received_feedback(self, profile_id: UUID) -> list[FeedbackDTO]:
        result = await self.session.execute(
            select(FeedbackModel)
            .join(MusicUploadModel, MusicUploadModel.id == FeedbackModel.target_upload_id)
            .where(MusicUploadModel.profile_id == profile_id)
            .order_by(FeedbackModel.created_at.desc())
        )
        return [await self._to_feedback_dto(feedback) for feedback in result.scalars().all()]

    async def list_notifications(self, user_id: UUID) -> list[NotificationDTO]:
        result = await self.session.execute(
            select(NotificationModel)
            .where(NotificationModel.user_id == user_id)
            .order_by(NotificationModel.created_at.desc())
        )
        return [self._to_notification_dto(notification) for notification in result.scalars().all()]

    async def list_conversation_summaries(self, user_id: UUID) -> list[ConversationSummaryDTO]:
        result = await self.session.execute(
            select(ConversationModel)
            .where(
                or_(
                    ConversationModel.user_1_id == user_id,
                    ConversationModel.user_2_id == user_id,
                )
            )
            .order_by(ConversationModel.last_message_at.desc().nulls_last(), ConversationModel.created_at.desc())
        )
        return await self._conversation_summaries(list(result.scalars().all()), user_id)

    async def get_conversation_summary(self, conversation_id: UUID, user_id: UUID) -> ConversationSummaryDTO | None:
        result = await self.session.execute(
            select(ConversationModel).where(
                ConversationModel.id == conversation_id,
                or_(
                    ConversationModel.user_1_id == user_id,
                    ConversationModel.user_2_id == user_id,
                ),
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation is None:
            return None
        summaries = await self._conversation_summaries([conversation], user_id)
        return summaries[0]

    async def list_messages(
        self,
        conversation_id: UUID,
        *,
        limit: int,
        before: datetime | None,
    ) -> list[MessageDTO]:
        query = select(MessageModel).where(MessageModel.conversation_id == conversation_id)
        if before is not None:
            query = query.where(MessageModel.created_at < before)
        result = await self.session.execute(
            query.order_by(MessageModel.created_at.desc(), MessageModel.id.desc()).limit(limit)
        )
        messages = list(result.scalars().all())
        messages.reverse()
        return await self._to_message_dtos(messages)

    async def get_message(self, message_id: UUID) -> MessageDTO | None:
        result = await self.session.execute(select(MessageModel).where(MessageModel.id == message_id))
        message = result.scalar_one_or_none()
        if message is None:
            return None
        return (await self._to_message_dtos([message]))[0]

    async def _conversation_summaries(
        self,
        conversations: list[ConversationModel],
        user_id: UUID,
    ) -> list[ConversationSummaryDTO]:
        if not conversations:
            return []
        conversation_ids = [conversation.id for conversation in conversations]
        other_user_ids = [
            conversation.user_2_id if conversation.user_1_id == user_id else conversation.user_1_id
            for conversation in conversations
        ]
        profiles = await self._profiles_by_user_ids(other_user_ids)
        last_messages = await self._latest_messages(conversation_ids)
        message_dtos = await self._to_message_dtos(list(last_messages.values()))
        messages_by_conversation = {message.conversation_id: message for message in message_dtos}
        unread_counts = await self._unread_counts(conversation_ids, user_id)
        summaries: list[ConversationSummaryDTO] = []
        for conversation in conversations:
            other_user_id = conversation.user_2_id if conversation.user_1_id == user_id else conversation.user_1_id
            summaries.append(
                ConversationSummaryDTO(
                    id=conversation.id,
                    other_user=_chat_user(profiles.get(other_user_id), other_user_id),
                    last_message=messages_by_conversation.get(conversation.id),
                    last_message_at=conversation.last_message_at,
                    unread_count=unread_counts.get(conversation.id, 0),
                    created_at=conversation.created_at,
                )
            )
        return summaries

    async def _profiles_by_user_ids(self, user_ids: list[UUID]) -> dict[UUID, MusicProfileModel]:
        if not user_ids:
            return {}
        result = await self.session.execute(
            select(MusicProfileModel).where(MusicProfileModel.user_id.in_(set(user_ids)))
        )
        return {profile.user_id: profile for profile in result.scalars().all()}

    async def _latest_messages(self, conversation_ids: list[UUID]) -> dict[UUID, MessageModel]:
        if not conversation_ids:
            return {}
        result = await self.session.execute(
            select(MessageModel)
            .where(MessageModel.conversation_id.in_(conversation_ids))
            .distinct(MessageModel.conversation_id)
            .order_by(MessageModel.conversation_id, MessageModel.created_at.desc(), MessageModel.id.desc())
        )
        return {message.conversation_id: message for message in result.scalars().all()}

    async def _unread_counts(self, conversation_ids: list[UUID], user_id: UUID) -> dict[UUID, int]:
        if not conversation_ids:
            return {}
        result = await self.session.execute(
            select(MessageModel.conversation_id, func.count(MessageModel.id))
            .where(
                MessageModel.conversation_id.in_(conversation_ids),
                MessageModel.sender_id != user_id,
                MessageModel.read_at.is_(None),
            )
            .group_by(MessageModel.conversation_id)
        )
        return {conversation_id: int(count) for conversation_id, count in result.all()}

    async def _to_message_dtos(self, messages: list[MessageModel]) -> list[MessageDTO]:
        beats = await self._beat_previews([message.beat_id for message in messages if message.beat_id is not None])
        return [
            MessageDTO(
                id=message.id,
                conversation_id=message.conversation_id,
                sender_id=message.sender_id,
                type=MessageTypeEnum(message.type),
                text=message.text,
                beat=beats.get(message.beat_id) if message.beat_id is not None else None,
                created_at=message.created_at,
                read_at=message.read_at,
            )
            for message in messages
        ]

    async def _beat_previews(self, beat_ids: list[UUID]) -> dict[UUID, BeatPreviewDTO]:
        if not beat_ids:
            return {}
        upload_result = await self.session.execute(
            select(MusicUploadModel).where(MusicUploadModel.id.in_(set(beat_ids)))
        )
        uploads = list(upload_result.scalars().all())
        profile_ids = {upload.profile_id for upload in uploads}
        profiles: dict[UUID, MusicProfileModel] = {}
        if profile_ids:
            profile_result = await self.session.execute(
                select(MusicProfileModel).where(MusicProfileModel.id.in_(profile_ids))
            )
            profiles = {profile.id: profile for profile in profile_result.scalars().all()}
        previews: dict[UUID, BeatPreviewDTO] = {}
        for upload in uploads:
            if not upload.audio_url.strip():
                continue
            owner = profiles.get(upload.profile_id)
            previews[upload.id] = BeatPreviewDTO(
                id=upload.id,
                profile_id=upload.profile_id,
                audio_url=upload.audio_url,
                title=upload.title,
                genre=upload.genre,
                tags=list(upload.tags),
                bpm=upload.bpm,
                owner=_chat_user(owner, owner.user_id) if owner is not None else None,
            )
        return previews

    async def _to_profile_dto(self, profile: MusicProfileModel) -> MusicProfileDTO:
        identity_result = await self.session.execute(
            select(MusicIdentityModel).where(MusicIdentityModel.profile_id == profile.id)
        )
        identity = identity_result.scalar_one_or_none()

        socials_result = await self.session.execute(
            select(SocialLinkModel).where(SocialLinkModel.profile_id == profile.id).order_by(SocialLinkModel.platform)
        )
        socials = [
            SocialLinkDTO(
                id=social.id,
                platform=SocialPlatformEnum(social.platform),
                url=social.url,
            )
            for social in socials_result.scalars().all()
        ]

        upload_result = await self.session.execute(
            select(MusicUploadModel).where(
                MusicUploadModel.profile_id == profile.id,
                MusicUploadModel.is_featured.is_(True),
            )
        )
        featured_upload = upload_result.scalar_one_or_none()

        return MusicProfileDTO(
            id=profile.id,
            user_id=profile.user_id,
            role=MusicProfileRoleEnum(profile.role),
            artist_name=profile.artist_name,
            avatar_url=profile.avatar_url,
            location=profile.location,
            experience_level=ExperienceLevelEnum(profile.experience_level),
            bio=profile.bio,
            collaboration_status=CollaborationStatusEnum(profile.collaboration_status),
            created_at=profile.created_at,
            updated_at=profile.updated_at,
            identity=self._to_identity_dto(identity) if identity else None,
            socials=socials,
            featured_upload=self._to_upload_dto(featured_upload) if featured_upload else None,
        )

    def _to_identity_dto(self, identity: MusicIdentityModel) -> MusicIdentityDTO:
        return MusicIdentityDTO(
            genres=identity.genres,
            influences=identity.influences,
            type_beats=identity.type_beats,
            moods=identity.moods,
            bpm_min=identity.bpm_min,
            bpm_max=identity.bpm_max,
        )

    def _to_upload_dto(self, upload: MusicUploadModel) -> MusicUploadDTO:
        return MusicUploadDTO(
            id=upload.id,
            profile_id=upload.profile_id,
            audio_url=upload.audio_url,
            title=upload.title,
            genre=upload.genre,
            tags=upload.tags,
            bpm=upload.bpm,
            description=upload.description,
            is_featured=upload.is_featured,
            created_at=upload.created_at,
        )

    def to_upload_dto(self, upload: MusicUploadModel) -> MusicUploadDTO:
        return self._to_upload_dto(upload)

    async def _to_connection_dto(self, connection: ConnectionModel) -> ConnectionDTO:
        requester = await self.get_profile_by_id(connection.requester_profile_id)
        receiver = await self.get_profile_by_id(connection.receiver_profile_id)
        return ConnectionDTO(
            id=connection.id,
            requester_profile_id=connection.requester_profile_id,
            receiver_profile_id=connection.receiver_profile_id,
            status=ConnectionStatusEnum(connection.status),
            created_at=connection.created_at,
            updated_at=connection.updated_at,
            requester_profile=requester,
            receiver_profile=receiver,
        )

    async def to_connection_dto(self, connection: ConnectionModel) -> ConnectionDTO:
        return await self._to_connection_dto(connection)

    async def _to_feedback_dto(self, feedback: FeedbackModel) -> FeedbackDTO:
        author = await self.get_profile_by_id(feedback.author_profile_id)
        upload = await self.get_upload(feedback.target_upload_id)
        return FeedbackDTO(
            id=feedback.id,
            author_profile_id=feedback.author_profile_id,
            target_upload_id=feedback.target_upload_id,
            category=FeedbackCategoryEnum(feedback.category),
            quick_reaction=feedback.quick_reaction,
            text=feedback.text,
            created_at=feedback.created_at,
            author_profile=author,
            target_upload=upload,
        )

    async def to_feedback_dto(self, feedback: FeedbackModel) -> FeedbackDTO:
        return await self._to_feedback_dto(feedback)

    def _to_notification_dto(self, notification: NotificationModel) -> NotificationDTO:
        return NotificationDTO(
            id=notification.id,
            user_id=notification.user_id,
            type=NotificationTypeEnum(notification.type),
            payload=notification.payload,
            is_read=notification.is_read,
            created_at=notification.created_at,
        )

    def to_notification_dto(self, notification: NotificationModel) -> NotificationDTO:
        return self._to_notification_dto(notification)
