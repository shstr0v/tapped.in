from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.query import Query
from vnu.application.dto.music import GetMusicProfileDTO, MusicProfileDTO
from vnu.application.errors.music import MusicProfileNotFoundError
from vnu.application.interactors.music.common import current_profile


class GetMyMusicProfile(Query[None, MusicProfileDTO]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self) -> MusicProfileDTO:
        return await current_profile(self.dao, self.idp)


class GetMusicProfileById(Query[GetMusicProfileDTO, MusicProfileDTO]):
    def __init__(self, dao: MusicDAO) -> None:
        self.dao = dao

    async def __call__(self, data: GetMusicProfileDTO) -> MusicProfileDTO:
        profile = await self.dao.get_profile_by_id(data.profile_id)
        if profile is None:
            raise MusicProfileNotFoundError("Music profile not found.")
        return profile
