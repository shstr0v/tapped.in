import json
from uuid import UUID

from redis.asyncio import Redis

from vnu.application.common.auth.session import SessionDAO
from vnu.application.dto.session import SessionDTO, GetSessionDTO, DeleteSessionDTO


KEY_PREFIX = "sess"
HNAME = "user"


class SessionDAOImpl(SessionDAO):
    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    def _key(self, session_id: str) -> str:
        return f"{KEY_PREFIX}:{session_id}"
    
    def _name(self, user_id: UUID) -> str:
        return f"{HNAME}:{user_id}"

    async def create(self, data: SessionDTO, ttl: int | None = None) -> SessionDTO:
        key = self._key(data.session)
        name = self._name(data.user_id)
        json_data = {
            "user_id": str(data.user_id),
            "session": data.session,
            "abs_exp": data.abs_exp,
            "idle_exp": data.idle_exp,
            "created_at": data.created_at,
            "last_seen": data.last_seen,
            "ua_hash": data.ua_hash,
            "rotated_from": data.rotated_from,
        }
        await self.redis.set(key, json.dumps(json_data), ex=ttl)
        await self.redis.sadd(name, key)
        
        return data

    async def get(self, data: GetSessionDTO) -> SessionDTO | None:
        key = self._key(data.session_id)
        data: str | None = await self.redis.get(key)

        return SessionDTO(**json.loads(data)) if data else None

    async def delete(self, data: DeleteSessionDTO) -> None:
        key = self._key(data.session_id)
        name = self._name(data.user_id)
        await self.redis.delete(key)
        await self.redis.srem(name, key)
        
    async def update(self, data: SessionDTO, ttl: int | None = None) -> None:
        key = self._key(data.session)
        name = self._name(data.user_id)
        await self.redis.set(key, json.dumps(data), ex=ttl)
        await self.redis.sadd(name, key)

    async def get_all(self, user_id: UUID) -> list[SessionDTO]:
        name = self._name(user_id)
        keys = await self.redis.smembers(name)
        return [SessionDTO(**json.loads(await self.redis.get(key))) for key in keys]
    
    async def delete_all(self, user_id: UUID) -> None:
        name = self._name(user_id)
        keys = await self.redis.smembers(name)
        await self.redis.delete(*keys)
        await self.redis.srem(name, *keys)
