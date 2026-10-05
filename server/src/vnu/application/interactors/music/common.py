from uuid import UUID

from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.dto.music import ConnectionDTO, MusicIdentityDTO, MusicProfileDTO
from vnu.application.errors.music import (
    DuplicateMusicActionError,
    InvalidMusicActionError,
    MusicProfileNotFoundError,
)
from vnu.domain.entities.music import calculate_match_score
from vnu.domain.entities.music.entities import Connection, MusicIdentity, MusicProfile, Notification
from vnu.domain.entities.music.enums import (
    CollaborationStatusEnum,
    ConnectionStatusEnum,
    ExperienceLevelEnum,
    MusicProfileRoleEnum,
    NotificationTypeEnum,
)
from vnu.domain.entities.music.scoring import MatchScore


async def current_user_id(idp: SessionIdProvider) -> UUID:
    user_id = await idp.get_current_id()
    return user_id.value


async def current_profile(dao: MusicDAO, idp: SessionIdProvider) -> MusicProfileDTO:
    profile = await dao.get_profile_by_user_id(await current_user_id(idp))
    if profile is None:
        raise MusicProfileNotFoundError("Music profile not found.")
    return profile


def notification_payload(profile: MusicProfileDTO, **extra: str) -> dict[str, str]:
    payload = {"profile_id": str(profile.id), "profile_name": profile.artist_name, **extra}
    if profile.avatar_url:
        payload["profile_avatar_url"] = profile.avatar_url
    return payload


def profile_entity_from_dto(profile: MusicProfileDTO) -> MusicProfile:
    return MusicProfile(
        id=profile.id,
        user_id=profile.user_id,
        role=MusicProfileRoleEnum(profile.role.value),
        artist_name=profile.artist_name,
        avatar_url=profile.avatar_url,
        location=profile.location,
        experience_level=ExperienceLevelEnum(profile.experience_level.value),
        bio=profile.bio,
        collaboration_status=CollaborationStatusEnum(profile.collaboration_status.value),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        identity=identity_entity_from_dto(profile.identity, profile.id),
    )


def identity_entity_from_dto(identity: MusicIdentityDTO | None, profile_id: UUID) -> MusicIdentity | None:
    if identity is None:
        return None
    return MusicIdentity(
        id=profile_id,
        profile_id=profile_id,
        genres=identity.genres,
        influences=identity.influences,
        type_beats=identity.type_beats,
        moods=identity.moods,
        bpm_min=identity.bpm_min,
        bpm_max=identity.bpm_max,
    )


def match_score_for(viewer: MusicProfileDTO, candidate: MusicProfileDTO) -> MatchScore:
    return calculate_match_score(
        viewer=profile_entity_from_dto(viewer),
        candidate=profile_entity_from_dto(candidate),
        viewer_identity=identity_entity_from_dto(viewer.identity, viewer.id),
        candidate_identity=identity_entity_from_dto(candidate.identity, candidate.id),
    )


async def create_or_accept_connection(
    repository: MusicRepository,
    requester: MusicProfileDTO,
    receiver: MusicProfileDTO,
    *,
    fail_on_existing_request: bool,
) -> tuple[ConnectionDTO, bool]:
    existing = await repository.get_connection_between(requester.id, receiver.id)
    accepted_now = False

    if existing is None:
        connection = Connection.create_pending(requester_profile_id=requester.id, receiver_profile_id=receiver.id)
        return await repository.save_connection(connection), accepted_now

    if existing.status == ConnectionStatusEnum.ACCEPTED:
        return await repository.save_connection(existing), accepted_now

    if existing.status == ConnectionStatusEnum.REJECTED:
        raise InvalidMusicActionError("Connection was rejected.")

    if existing.receiver_profile_id == requester.id:
        existing.accept(requester.id)
        accepted_now = True
        connection_dto = await repository.save_connection(existing)
        await repository.save_notification(
            Notification.create(
                user_id=requester.user_id,
                type=NotificationTypeEnum.CONNECTION_ACCEPTED,
                payload=notification_payload(receiver, connection_id=str(existing.id)),
            )
        )
        await repository.save_notification(
            Notification.create(
                user_id=receiver.user_id,
                type=NotificationTypeEnum.CONNECTION_ACCEPTED,
                payload=notification_payload(requester, connection_id=str(existing.id)),
            )
        )
        return connection_dto, accepted_now

    if fail_on_existing_request:
        raise DuplicateMusicActionError("Connection request already exists.")

    return await repository.save_connection(existing), accepted_now
