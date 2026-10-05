from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import MarkNotificationReadDTO, NotificationDTO
from vnu.application.errors.music import NotificationNotFoundError
from vnu.application.interactors.music.common import current_user_id


class MarkNotificationRead(Interactor[MarkNotificationReadDTO, NotificationDTO]):
    def __init__(self, repository: MusicRepository, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: MarkNotificationReadDTO) -> NotificationDTO:
        notification = await self.repository.mark_notification_read(
            data.notification_id,
            await current_user_id(self.idp),
        )
        if notification is None:
            raise NotificationNotFoundError("Notification not found.")
        await self.uow.commit()
        return notification
