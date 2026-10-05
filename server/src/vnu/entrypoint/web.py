from typing import Any, TypeVar, Callable, AsyncIterator, AsyncContextManager
from contextlib import asynccontextmanager

import uvicorn
from dishka import AsyncContainer
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from dishka.integrations.fastapi import setup_dishka

from vnu.entrypoint.di.container import get_async_container
from vnu.adapters.config import Config
from vnu.presentation.http.common import include_exception_handlers, include_routers


def get_log_config() -> dict[str, Any]:
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s [%(levelname)s] [%(name)s] %(module)s %(message)s"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            },
        },
        "root": {
            "level": "DEBUG",
            "handlers": ["console"],
        },
    }


DependencyT = TypeVar("DependencyT")


def singleton(value: DependencyT) -> Callable[[], DependencyT]:
    """Produce save value as a fastapi dependency."""

    def singleton_factory() -> DependencyT:
        return value

    return singleton_factory


def startup_lifespan() -> Callable[[FastAPI], AsyncContextManager[None]]:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        await app.state.dishka_container.close()

    return lifespan


def get_app(
    container: AsyncContainer,
    cors_origins: tuple[str, ...],
) -> FastAPI:
    fastapi = FastAPI(
        title="vnu",
        debug=True,
        lifespan=startup_lifespan(),
        default_response_class=JSONResponse,
    )

    fastapi.add_middleware(
        CORSMiddleware,
        allow_origins=list(cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @fastapi.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    include_exception_handlers(fastapi)
    include_routers(fastapi)
    setup_dishka(container=container, app=fastapi)

    return fastapi


def main() -> None:
    config = Config.load_from_environment()
    container = get_async_container(config)
    app = get_app(container, config.cors_origins)
    log_config = get_log_config()

    uvicorn.run(app, log_config=log_config, host="0.0.0.0")


if __name__ == "__main__":
    main()
