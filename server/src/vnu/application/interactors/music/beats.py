from vnu.adapters.auth.idp import SessionIdProvider
from vnu.adapters.config import AwsConfig
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import BeatDTO, CreateBeatDTO
from vnu.application.interactors.music.beat_audio import require_owned_beat_key, to_beat_dto
from vnu.application.interactors.music.common import current_profile
from vnu.domain.entities.music.entities import MusicUpload


class CreateBeat(Interactor[CreateBeatDTO, BeatDTO]):
    def __init__(
        self,
        repository: MusicRepository,
        dao: MusicDAO,
        uow: UoW,
        idp: SessionIdProvider,
        config: AwsConfig,
    ) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp
        self.config = config

    async def __call__(self, data: CreateBeatDTO) -> BeatDTO:
        profile = await current_profile(self.dao, self.idp)
        key = require_owned_beat_key(data.audio_key, profile.user_id)
        upload = MusicUpload.create(
            profile_id=profile.id,
            audio_url=self.config.object_url(key),
            title=data.title,
            genre=data.genre,
            tags=data.tags,
            bpm=data.bpm,
            description=data.description,
            is_featured=True,
        )
        result = await self.repository.save_upload(upload)
        await self.uow.commit()
        return to_beat_dto(result, profile)
