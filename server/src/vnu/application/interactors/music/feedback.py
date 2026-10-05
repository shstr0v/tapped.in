from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import CreateFeedbackDTO, FeedbackDTO
from vnu.application.errors.music import MusicProfileNotFoundError, MusicUploadNotFoundError
from vnu.application.interactors.music.common import current_profile, notification_payload
from vnu.domain.entities.music.entities import Feedback, Notification
from vnu.domain.entities.music.enums import NotificationTypeEnum


class CreateFeedback(Interactor[CreateFeedbackDTO, FeedbackDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: CreateFeedbackDTO) -> FeedbackDTO:
        profile = await current_profile(self.dao, self.idp)
        upload = await self.dao.get_upload(data.target_upload_id)
        if upload is None:
            raise MusicUploadNotFoundError("Target upload not found.")
        target_profile = await self.dao.get_profile_by_id(upload.profile_id)
        if target_profile is None:
            raise MusicProfileNotFoundError("Target music profile not found.")
        feedback = Feedback.create(
            author_profile_id=profile.id,
            target_profile_id=target_profile.id,
            target_upload_id=upload.id,
            category=data.category,
            quick_reaction=data.quick_reaction,
            text=data.text,
        )
        result = await self.repository.save_feedback(feedback)
        await self.repository.save_notification(
            Notification.create(
                user_id=target_profile.user_id,
                type=NotificationTypeEnum.NEW_FEEDBACK,
                payload=notification_payload(
                    profile,
                    feedback_id=str(feedback.id),
                    upload_id=str(upload.id),
                ),
            )
        )
        await self.uow.commit()
        return result
