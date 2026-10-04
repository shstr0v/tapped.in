from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from vnu.application.common.error import ApplicationError
from vnu.application.errors.auth import UnauthorizedError
from vnu.application.errors.user import UserNotFoundError
from vnu.presentation.http.routers.auth import router as auth_router
from vnu.presentation.http.routers.users import router as users_router


def include_routers(app: FastAPI) -> None:
    app.include_router(auth_router)
    app.include_router(users_router)


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

    @app.exception_handler(ApplicationError)
    async def application_error_handler(request: Request, exc: ApplicationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": getattr(exc, "message", str(exc) or "Application error")},
        )
