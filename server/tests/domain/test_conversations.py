from uuid import uuid4

import pytest

from vnu.domain.entities.music.entities import Conversation, Message
from vnu.domain.entities.music.enums import MessageTypeEnum
from vnu.domain.exceptions.music import InvalidMessageError


def test_conversation_pair_is_stable_regardless_of_argument_order() -> None:
    first_user_id = uuid4()
    second_user_id = uuid4()

    left = Conversation.create(first_user_id, second_user_id)
    right = Conversation.create(second_user_id, first_user_id)

    assert (left.user_1_id, left.user_2_id) == (right.user_1_id, right.user_2_id)
    assert str(left.user_1_id) < str(left.user_2_id)
    assert left.includes(first_user_id)
    assert left.other_user_id(first_user_id) == second_user_id


def test_conversation_cannot_target_self() -> None:
    user_id = uuid4()

    with pytest.raises(InvalidMessageError, match="yourself"):
        Conversation.create(user_id, user_id)


def test_text_message_strips_and_rejects_blank_text() -> None:
    conversation_id = uuid4()
    sender_id = uuid4()

    message = Message.create_text(conversation_id, sender_id, "  yo this beat is crazy  ")

    assert message.type == MessageTypeEnum.TEXT
    assert message.text == "yo this beat is crazy"
    assert message.sender_id == sender_id
    assert message.beat_id is None
    with pytest.raises(InvalidMessageError, match="non-empty"):
        Message.create_text(conversation_id, sender_id, "   ")


def test_beat_message_references_a_beat_without_copying_text() -> None:
    beat_id = uuid4()

    message = Message.create_beat(uuid4(), uuid4(), beat_id)

    assert message.type == MessageTypeEnum.BEAT
    assert message.beat_id == beat_id
    assert message.text is None
