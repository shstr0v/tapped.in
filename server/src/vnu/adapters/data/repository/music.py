import uuid
from uuid import UUID

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from vnu.adapters.data.dao.music import MusicDAOImpl
from vnu.adapters.data.models import (
    ConnectionModel,
    FeedbackModel,
    MusicIdentityModel,
    MusicProfileModel,
    MusicUploadModel,
    NotificationModel,
    SocialLinkModel,
    SwipeModel,
)
from vnu.application.common.music.repository import MusicRepository
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
    Feedback,
    MusicIdentity,
    MusicProfile,
    MusicUpload,
    Notification,
    Swipe,
)
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    MusicProfileRoleEnum,
)


class MusicRepositoryImpl(MusicRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.dao = MusicDAOImpl(session)

    async def save_profile(
        self,
        profile: MusicProfile,
        identity: MusicIdentityInputDTO | None,
        socials: list[SocialLinkInputDTO],
    ) -> MusicProfileDTO:
        self.session.add(self._profile_to_model(profile))
        await self.session.flush()
        await self._replace_identity(profile.id, identity)
        await self._replace_socials(profile.id, socials)
        await self.session.flush()
        profile_dto = await self.dao.get_profile_by_id(profile.id)
        if profile_dto is None:
            raise RuntimeError("Saved profile was not found.")
        return profile_dto

    async def update_profile(
        self,
        profile: MusicProfile,
        identity: MusicIdentityInputDTO | None,
        socials: list[SocialLinkInputDTO] | None,
    ) -> MusicProfileDTO:
        await self.session.merge(self._profile_to_model(profile))
        await self.session.flush()
        if identity is not None:
            await self._replace_identity(profile.id, identity)
        if socials is not None:
            await self._replace_socials(profile.id, socials)
        await self.session.flush()
        profile_dto = await self.dao.get_profile_by_id(profile.id)
        if profile_dto is None:
            raise RuntimeError("Updated profile was not found.")
        return profile_dto

    async def get_profile_entity_by_user_id(self, user_id: UUID) -> MusicProfile | None:
        result = await self.session.execute(select(MusicProfileModel).where(MusicProfileModel.user_id == user_id))
        profile = result.scalar_one_or_none()
        return await self._to_profile_entity(profile) if profile else None

    async def get_profile_entity_by_id(self, profile_id: UUID) -> MusicProfile | None:
        result = await self.session.execute(select(MusicProfileModel).where(MusicProfileModel.id == profile_id))
        profile = result.scalar_one_or_none()
        return await self._to_profile_entity(profile) if profile else None

    async def replace_featured_upload(self, upload: MusicUpload) -> MusicUploadDTO:
        await self.session.execute(delete(MusicUploadModel).where(MusicUploadModel.profile_id == upload.profile_id))
        upload_model = MusicUploadModel(
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
        self.session.add(upload_model)
        await self.session.flush(objects=[upload_model])
        return self.dao.to_upload_dto(upload_model)

    async def delete_upload(self, upload_id: UUID, profile_id: UUID) -> bool:
        result = await self.session.execute(
            delete(MusicUploadModel)
            .where(MusicUploadModel.id == upload_id, MusicUploadModel.profile_id == profile_id)
            .returning(MusicUploadModel.id)
        )
        return result.scalar_one_or_none() is not None

    async def save_swipe(self, swipe: Swipe) -> None:
        self.session.add(
            SwipeModel(
                id=swipe.id,
                actor_profile_id=swipe.actor_profile_id,
                target_profile_id=swipe.target_profile_id,
                action=swipe.action.value,
                match_score=swipe.match_score,
                created_at=swipe.created_at,
            )
        )
        await self.session.flush()

    async def get_connection_between(self, first_profile_id: UUID, second_profile_id: UUID) -> Connection | None:
        pair_first, pair_second = self._pair(first_profile_id, second_profile_id)
        result = await self.session.execute(
            select(ConnectionModel).where(
                ConnectionModel.pair_first_profile_id == pair_first,
                ConnectionModel.pair_second_profile_id == pair_second,
            )
        )
        connection = result.scalar_one_or_none()
        return self._to_connection_entity(connection) if connection else None

    async def save_connection(self, connection: Connection) -> ConnectionDTO:
        pair_first, pair_second = self._pair(connection.requester_profile_id, connection.receiver_profile_id)
        model = ConnectionModel(
            id=connection.id,
            requester_profile_id=connection.requester_profile_id,
            receiver_profile_id=connection.receiver_profile_id,
            pair_first_profile_id=pair_first,
            pair_second_profile_id=pair_second,
            status=connection.status.value,
            created_at=connection.created_at,
            updated_at=connection.updated_at,
        )
        await self.session.merge(model)
        await self.session.flush()
        persisted = await self._get_connection_model(connection.id)
        if persisted is None:
            raise RuntimeError("Saved connection was not found.")
        return await self.dao.to_connection_dto(persisted)

    async def get_connection(self, connection_id: UUID) -> Connection | None:
        connection = await self._get_connection_model(connection_id)
        return self._to_connection_entity(connection) if connection else None

    async def save_feedback(self, feedback: Feedback) -> FeedbackDTO:
        model = FeedbackModel(
            id=feedback.id,
            author_profile_id=feedback.author_profile_id,
            target_upload_id=feedback.target_upload_id,
            category=feedback.category.value,
            quick_reaction=feedback.quick_reaction,
            text=feedback.text,
            created_at=feedback.created_at,
        )
        self.session.add(model)
        await self.session.flush(objects=[model])
        return await self.dao.to_feedback_dto(model)

    async def save_notification(self, notification: Notification) -> NotificationDTO:
        model = NotificationModel(
            id=notification.id,
            user_id=notification.user_id,
            type=notification.type.value,
            payload=notification.payload,
            is_read=notification.is_read,
            created_at=notification.created_at,
        )
        self.session.add(model)
        await self.session.flush(objects=[model])
        return self.dao.to_notification_dto(model)

    async def mark_notification_read(self, notification_id: UUID, user_id: UUID) -> NotificationDTO | None:
        result = await self.session.execute(
            update(NotificationModel)
            .where(NotificationModel.id == notification_id, NotificationModel.user_id == user_id)
            .values(is_read=True)
            .returning(NotificationModel)
        )
        notification = result.scalar_one_or_none()
        return self.dao.to_notification_dto(notification) if notification else None

    async def _replace_identity(self, profile_id: UUID, identity: MusicIdentityInputDTO | None) -> None:
        if identity is None:
            return
        await self.session.execute(delete(MusicIdentityModel).where(MusicIdentityModel.profile_id == profile_id))
        self.session.add(
            MusicIdentityModel(
                id=uuid.uuid4(),
                profile_id=profile_id,
                genres=identity.genres,
                influences=identity.influences,
                type_beats=identity.type_beats,
                moods=identity.moods,
                bpm_min=identity.bpm_min,
                bpm_max=identity.bpm_max,
            )
        )

    async def _replace_socials(self, profile_id: UUID, socials: list[SocialLinkInputDTO]) -> None:
        await self.session.execute(delete(SocialLinkModel).where(SocialLinkModel.profile_id == profile_id))
        for social in socials:
            self.session.add(
                SocialLinkModel(
                    id=uuid.uuid4(),
                    profile_id=profile_id,
                    platform=social.platform.value,
                    url=social.url,
                )
            )

    async def _to_profile_entity(self, profile: MusicProfileModel) -> MusicProfile:
        identity_result = await self.session.execute(
            select(MusicIdentityModel).where(MusicIdentityModel.profile_id == profile.id)
        )
        identity_model = identity_result.scalar_one_or_none()
        return MusicProfile(
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
            identity=self._to_identity_entity(identity_model) if identity_model else None,
        )

    def _to_identity_entity(self, identity: MusicIdentityModel) -> MusicIdentity:
        return MusicIdentity(
            id=identity.id,
            profile_id=identity.profile_id,
            genres=identity.genres,
            influences=identity.influences,
            type_beats=identity.type_beats,
            moods=identity.moods,
            bpm_min=identity.bpm_min,
            bpm_max=identity.bpm_max,
        )

    def _profile_to_model(self, profile: MusicProfile) -> MusicProfileModel:
        return MusicProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            role=profile.role.value,
            artist_name=profile.artist_name,
            avatar_url=profile.avatar_url,
            location=profile.location,
            experience_level=profile.experience_level.value,
            bio=profile.bio,
            collaboration_status=profile.collaboration_status.value,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    async def _get_connection_model(self, connection_id: UUID) -> ConnectionModel | None:
        result = await self.session.execute(select(ConnectionModel).where(ConnectionModel.id == connection_id))
        return result.scalar_one_or_none()

    def _to_connection_entity(self, connection: ConnectionModel) -> Connection:
        return Connection(
            id=connection.id,
            requester_profile_id=connection.requester_profile_id,
            receiver_profile_id=connection.receiver_profile_id,
            status=ConnectionStatusEnum(connection.status),
            created_at=connection.created_at,
            updated_at=connection.updated_at,
        )

    def _pair(self, first_profile_id: UUID, second_profile_id: UUID) -> tuple[UUID, UUID]:
        first, second = sorted((first_profile_id, second_profile_id), key=str)
        return first, second
