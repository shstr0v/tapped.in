from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import CreateFeaturedUploadDTO, DeleteUploadDTO, MusicUploadDTO
from vnu.application.errors.music import MusicUploadNotFoundError
from vnu.application.interactors.music.common import current_profile
from vnu.domain.entities.music.entities import MusicUpload


class CreateFeaturedUpload(Interactor[CreateFeaturedUploadDTO, MusicUploadDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: CreateFeaturedUploadDTO) -> MusicUploadDTO:
        profile = await current_profile(self.dao, self.idp)
        upload = MusicUpload.create_featured(
            profile_id=profile.id,
            audio_url=data.audio_url,
            title=data.title,
            genre=data.genre,
            tags=data.tags,
            bpm=data.bpm,
            description=data.description,
        )
        result = await self.repository.replace_featured_upload(upload)
        await self.uow.commit()
        return result


class DeleteUpload(Interactor[DeleteUploadDTO, None]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: DeleteUploadDTO) -> None:
        profile = await current_profile(self.dao, self.idp)
        deleted = await self.repository.delete_upload(data.upload_id, profile.id)
        if not deleted:
            raise MusicUploadNotFoundError("Music upload not found.")
        await self.uow.commit()
