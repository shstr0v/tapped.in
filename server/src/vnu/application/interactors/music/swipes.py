from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.common.interactor import Interactor
from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.common.uow import UoW
from vnu.application.dto.music import SwipeDTO, SwipeInputDTO
from vnu.application.errors.music import DuplicateMusicActionError, MusicProfileNotFoundError
from vnu.application.interactors.music.common import create_or_accept_connection, current_profile, match_score_for
from vnu.domain.entities.music.entities import Swipe
from vnu.domain.entities.music.enums import SwipeActionEnum


class SwipeProfile(Interactor[SwipeInputDTO, SwipeDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None:
        self.repository = repository
        self.dao = dao
        self.uow = uow
        self.idp = idp

    async def __call__(self, data: SwipeInputDTO) -> SwipeDTO:
        profile = await current_profile(self.dao, self.idp)
        target = await self.dao.get_profile_by_id(data.target_profile_id)
        if target is None:
            raise MusicProfileNotFoundError("Target music profile not found.")
        if await self.dao.get_swipe_action(profile.id, target.id) is not None:
            raise DuplicateMusicActionError("Profile already swiped.")

        match = match_score_for(profile, target)
        swipe = Swipe.create(
            actor_profile_id=profile.id,
            target_profile_id=target.id,
            action=data.action,
            match_score=match.score,
        )
        await self.repository.save_swipe(swipe)
        if data.action == SwipeActionEnum.LIKE:
            await create_or_accept_connection(
                self.repository,
                requester=profile,
                receiver=target,
                fail_on_existing_request=False,
            )
        await self.uow.commit()
        return SwipeDTO(
            id=swipe.id,
            actor_profile_id=swipe.actor_profile_id,
            target_profile_id=swipe.target_profile_id,
            action=swipe.action,
            match_score=swipe.match_score,
            created_at=swipe.created_at,
        )
