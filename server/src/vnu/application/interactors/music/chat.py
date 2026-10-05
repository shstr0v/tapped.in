from uuid import UUID

from vnu.application.common.music.dao import MusicDAO
from vnu.application.common.music.repository import MusicRepository
from vnu.application.errors.music import ConversationNotFoundError, ForbiddenMusicActionError, MusicUploadNotFoundError
from vnu.domain.entities.music.entities import Conversation
from vnu.domain.entities.music.enums import ConnectionStatusEnum


async def require_conversation(
    repository: MusicRepository,
    conversation_id: UUID,
    user_id: UUID,
) -> Conversation:
    conversation = await repository.get_conversation(conversation_id)
    if conversation is None or not conversation.includes(user_id):
        raise ConversationNotFoundError("Conversation not found.")
    return conversation


async def require_accepted_connection(
    repository: MusicRepository,
    profile_id: UUID,
    other_profile_id: UUID,
) -> None:
    connection = await repository.get_connection_between(profile_id, other_profile_id)
    if connection is None or connection.status != ConnectionStatusEnum.ACCEPTED:
        raise ForbiddenMusicActionError("You can only message people you are connected with.")


async def assert_shareable_beat(
    dao: MusicDAO,
    sender_profile_id: UUID,
    other_profile_id: UUID,
    beat_id: UUID,
) -> None:
    upload = await dao.get_upload(beat_id)
    if upload is None:
        raise MusicUploadNotFoundError("Beat not found.")
    if not upload.audio_url.strip():
        raise ForbiddenMusicActionError("This beat does not have playable audio.")
    if upload.profile_id not in {sender_profile_id, other_profile_id}:
        raise ForbiddenMusicActionError("You can only share beats from this conversation.")
