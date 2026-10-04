from collections.abc import AsyncIterator

from dishka import AnyOf, Provider, Scope, provide
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from vnu.adapters.config import DatabaseConfig
from vnu.application.common.uow import UoW


class ConnectionProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_engine(self, config: DatabaseConfig) -> AsyncIterator[AsyncEngine]:
        engine = create_async_engine(
            config.connection_url,
            query_cache_size=1200,
            pool_size=20,
            max_overflow=200,
            future=True,
            echo=False,
        )
        yield engine
        await engine.dispose()

    @provide(scope=Scope.APP)
    async def get_async_sessionmaker(
        self,
        engine: AsyncEngine,
    ) -> async_sessionmaker[AsyncSession]:
        session_factory = async_sessionmaker(
            engine,
            expire_on_commit=False,
            class_=AsyncSession,
        )
        return session_factory

    @provide(scope=Scope.REQUEST)
    async def get_async_session(
        self,
        session_factory: async_sessionmaker[AsyncSession],
    ) -> AsyncIterator[AnyOf[AsyncSession, UoW]]:
        async with session_factory() as session:
            yield session
