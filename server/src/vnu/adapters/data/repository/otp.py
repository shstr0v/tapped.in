import json
from uuid import UUID

from redis.asyncio import Redis

from vnu.application.common.otp.repository import OtpRepository
from vnu.domain.entities.auth.entities import OneTimePasscode
from vnu.domain.entities.auth.value_objects import (
    PasscodeId,
    Passcode,
)
from vnu.domain.entities.user.value_objects import UserId, PhoneNumber


class OtpRepositoryImpl(OtpRepository):
    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    async def load_by_user_id(self, user_id: UserId) -> OneTimePasscode | None:
        user_id_bytes = str(user_id.raw()).encode("utf-8")
        otp = await self.redis.get(user_id_bytes)
        if otp is None:
            return None

        response = json.loads(otp)

        return OneTimePasscode(
            id=PasscodeId(UUID(response["id"])),
            phone=PhoneNumber.create(response["phone"]),
            user_id=UserId(response["user_id"]),
            code=Passcode(response["code"]),
        )

    async def create(self, otp: OneTimePasscode) -> OneTimePasscode:
        user_id_bytes = str(otp.user_id.raw()).encode("utf-8")
        json_otp = json.dumps(
            {
                "id": str(otp.id.raw()),
                "phone": otp.phone.raw(),
                "user_id": str(otp.user_id.raw()),
                "code": otp.code.value,
            }
        )
        await self.redis.set(user_id_bytes, json_otp)

        return otp

    async def update(self, otp: OneTimePasscode) -> OneTimePasscode:
        user_id_bytes = str(otp.user_id.raw()).encode("utf-8")
        json_otp = json.dumps(
            {
                "id": str(otp.id.raw()),
                "phone": otp.phone.raw(),
                "user_id": str(otp.user_id.raw()),
                "code": otp.code.value,
            }
        )

        await self.redis.set(user_id_bytes, json_otp)

        return otp
