from vnu.application.common.error import ApplicationError


class UserNotFoundError(ApplicationError):
    ...


class UserAlreadyExists(ApplicationError):
    ...


class UserAlreadyCompletedOnboarding(ApplicationError):
    ...
