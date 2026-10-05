from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.query import Query
from vnu.application.dto.music import BeatDTO, GetBeatDTO
from vnu.application.errors.music import MusicProfileNotFoundError, MusicUploadNotFoundError
from vnu.application.interactors.music.beat_audio import to_beat_dto
from vnu.application.interactors.music.common import current_profile


class ListMyBeats(Query[None, list[BeatDTO]]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self) -> list[BeatDTO]:
        profile = await current_profile(self.dao, self.idp)
        uploads = await self.dao.list_uploads(profile.id)
        return [to_beat_dto(upload, profile) for upload in uploads]


class GetBeat(Query[GetBeatDTO, BeatDTO]):
    def __init__(self, dao: MusicDAO, idp: SessionIdProvider) -> None:
        self.dao = dao
        self.idp = idp

    async def __call__(self, data: GetBeatDTO) -> BeatDTO:
        await current_profile(self.dao, self.idp)
        upload = await self.dao.get_upload(data.beat_id)
        if upload is None:
            raise MusicUploadNotFoundError("Beat not found.")
        owner = await self.dao.get_profile_by_id(upload.profile_id)
        if owner is None:
            raise MusicProfileNotFoundError("Beat owner not found.")
        return to_beat_dto(upload, owner)
