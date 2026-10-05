from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import ConnectionActionDTO, ConnectionDTO, ConnectionProfileDTO
from vnu.application.errors.music import ConnectionNotFoundError, MusicProfileNotFoundError
from vnu.application.interactors.music.common import create_or_accept_connection, current_profile, notification_payload
from vnu.domain.entities.music.entities import Notification
from vnu.domain.entities.music.enums import NotificationTypeEnum


class RequestConnection(Interactor[ConnectionProfileDTO, ConnectionDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: ConnectionProfileDTO) -> ConnectionDTO:
        profile = await current_profile(self.dao, self.idp)
        target = await self.dao.get_profile_by_id(data.profile_id)
        if target is None:
            raise MusicProfileNotFoundError("Target music profile not found.")
        connection, _ = await create_or_accept_connection(
            self.repository,
            profile,
            target,
            fail_on_existing_request=True,
        )
        await self.uow.commit()
        return connection


class AcceptConnection(Interactor[ConnectionActionDTO, ConnectionDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: ConnectionActionDTO) -> ConnectionDTO:
        profile = await current_profile(self.dao, self.idp)
        connection = await self.repository.get_connection(data.connection_id)
        if connection is None:
            raise ConnectionNotFoundError("Connection not found.")
        connection.accept(profile.id)
        result = await self.repository.save_connection(connection)
        requester = await self.dao.get_profile_by_id(connection.requester_profile_id)
        if requester is not None:
            await self.repository.save_notification(
                Notification.create(
                    user_id=requester.user_id,
                    type=NotificationTypeEnum.CONNECTION_ACCEPTED,
                    payload=notification_payload(profile, connection_id=str(connection.id)),
                )
            )
        await self.uow.commit()
        return result


class RejectConnection(Interactor[ConnectionActionDTO, ConnectionDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: ConnectionActionDTO) -> ConnectionDTO:
        profile = await current_profile(self.dao, self.idp)
        connection = await self.repository.get_connection(data.connection_id)
        if connection is None:
            raise ConnectionNotFoundError("Connection not found.")
        connection.reject(profile.id)
        result = await self.repository.save_connection(connection)
        await self.uow.commit()
        return result
