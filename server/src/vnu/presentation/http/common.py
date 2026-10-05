from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from vnu.application.common.error import ApplicationError
from vnu.application.errors.auth import UnauthorizedError
from vnu.application.errors.music import (
    ConnectionNotFoundError,
    ConversationNotFoundError,
    DuplicateMusicActionError,
    ForbiddenMusicActionError,
    InvalidMusicActionError,
    MusicProfileAlreadyExistsError,
    MusicProfileNotFoundError,
    MusicUploadNotFoundError,
    NotificationNotFoundError,
)
from vnu.application.errors.user import UserNotFoundError
from vnu.domain.exceptions.music import (
    InvalidMessageError,
    InvalidMusicInteractionError,
    InvalidMusicProfileError,
    InvalidMusicUploadError,
)
from vnu.presentation.http.routers.auth import router as auth_router
from vnu.presentation.http.routers.connections import router as connections_router
from vnu.presentation.http.routers.conversations import router as conversations_router
from vnu.presentation.http.routers.feedback import router as feedback_router
from vnu.presentation.http.routers.notifications import router as notifications_router
from vnu.presentation.http.routers.profiles import router as profiles_router
from vnu.presentation.http.routers.recommendations import router as recommendations_router
from vnu.presentation.http.routers.swipes import router as swipes_router
from vnu.presentation.http.routers.uploads import router as uploads_router
from vnu.presentation.http.routers.users import router as users_router


def include_routers(app: FastAPI) -> None:
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(profiles_router)
    app.include_router(uploads_router)
    app.include_router(recommendations_router)
    app.include_router(swipes_router)
    app.include_router(connections_router)
    app.include_router(conversations_router)
    app.include_router(feedback_router)
    app.include_router(notifications_router)


def include_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(UnauthorizedError)
    async def unauthorized_handler(request: Request, exc: UnauthorizedError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": getattr(exc, "message", "Unauthorized")},
        )

    @app.exception_handler(UserNotFoundError)
    async def user_not_found_handler(request: Request, exc: UserNotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc) or "User not found"},
        )

    async def music_not_found_handler(request: Request, exc: ApplicationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": getattr(exc, "message", str(exc) or "Not found")},
        )

    async def music_conflict_handler(request: Request, exc: ApplicationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": getattr(exc, "message", str(exc) or "Conflict")},
        )

    async def music_forbidden_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": getattr(exc, "message", str(exc) or "Forbidden")},
        )

    async def music_validation_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": getattr(exc, "message", str(exc) or "Validation error")},
        )

    for exception_type in (
        MusicProfileNotFoundError,
        MusicUploadNotFoundError,
        ConnectionNotFoundError,
        ConversationNotFoundError,
        NotificationNotFoundError,
    ):
        app.add_exception_handler(exception_type, music_not_found_handler)

    for exception_type in (DuplicateMusicActionError, InvalidMusicActionError, MusicProfileAlreadyExistsError):
        app.add_exception_handler(exception_type, music_conflict_handler)

    for exception_type in (ForbiddenMusicActionError, InvalidMusicInteractionError):
        app.add_exception_handler(exception_type, music_forbidden_handler)

    for exception_type in (InvalidMusicProfileError, InvalidMusicUploadError, InvalidMessageError):
        app.add_exception_handler(exception_type, music_validation_handler)

    @app.exception_handler(ApplicationError)
    async def application_error_handler(request: Request, exc: ApplicationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": getattr(exc, "message", str(exc) or "Application error")},
        )
