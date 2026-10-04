from vnu.application.common.error import ApplicationError


class UnauthorizedError(ApplicationError):
    def __init__(self, message: str | None = None) -> None:
        self.message = message

        if message is None:
            self.message = "Unauthorized"


class InvalidPasswordError(ApplicationError):
    def __init__(self, message: str | None = None) -> None:
        self.message = message

        if message is None:
            self.message = "Invalid password"


class BearerParserError(ApplicationError): ...


class PermissionDeniedError(ApplicationError): ...

class TelegramInitDataParserError(ApplicationError): ...
