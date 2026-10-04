from uuid import uuid4

from vnu.domain.common.entity import Entity
from vnu.domain.entities.auth.value_objects import (
    PasscodeId,
    Passcode,
)
from vnu.domain.entities.user.value_objects import UserId, PhoneNumber


class OneTimePasscode(Entity):
    __slots__ = (
        "code",
        "phone",
        "id",
        "user_id",
    )

    def __init__(
        self,
        id: PasscodeId,
        phone: PhoneNumber,
        user_id: UserId,
        code: Passcode,
    ) -> None:
        self.id = id
        self.phone = phone
        self.user_id = user_id
        self.code = code

    @classmethod
    def create(
        cls,
        user_id: UserId,
        phone: PhoneNumber,
        code: Passcode,
    ) -> "OneTimePasscode":
        return cls(
            id=PasscodeId(uuid4()),
            phone=phone,
            user_id=user_id,
            code=code,
        )
