from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import MusicProfileDTO, UpdateMusicProfileDTO, UpsertMusicProfileDTO
from vnu.application.errors.music import MusicProfileNotFoundError
from vnu.application.interactors.music.common import current_user_id
from vnu.domain.entities.music.entities import MusicProfile


class UpsertMyMusicProfile(Interactor[UpsertMusicProfileDTO, MusicProfileDTO]):
    def __init__(self, repository: MusicRepository, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: UpsertMusicProfileDTO) -> MusicProfileDTO:
        user_id = await current_user_id(self.idp)
        profile = await self.repository.get_profile_entity_by_user_id(user_id)
        if profile is None:
            profile = MusicProfile.create(
                user_id=user_id,
                role=data.role,
                artist_name=data.artist_name,
                avatar_url=data.avatar_url,
                location=data.location,
                experience_level=data.experience_level,
                bio=data.bio,
                collaboration_status=data.collaboration_status,
            )
            result = await self.repository.save_profile(profile, data.identity, data.socials)
        else:
            profile.update(
                role=data.role,
                artist_name=data.artist_name,
                avatar_url=data.avatar_url,
                location=data.location,
                experience_level=data.experience_level,
                bio=data.bio,
                collaboration_status=data.collaboration_status,
            )
            result = await self.repository.update_profile(profile, data.identity, data.socials)
        await self.uow.commit()
        return result


class UpdateMyMusicProfile(Interactor[UpdateMusicProfileDTO, MusicProfileDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: UpdateMusicProfileDTO) -> MusicProfileDTO:
        user_id = await current_user_id(self.idp)
        profile = await self.repository.get_profile_entity_by_user_id(user_id)
        if profile is None:
            raise MusicProfileNotFoundError("Music profile not found.")
        profile.update(
            role=data.role,
            artist_name=data.artist_name,
            avatar_url=data.avatar_url,
            location=data.location,
            experience_level=data.experience_level,
            bio=data.bio,
            collaboration_status=data.collaboration_status,
        )
        result = await self.repository.update_profile(profile, data.identity, data.socials)
        await self.uow.commit()
        return result
