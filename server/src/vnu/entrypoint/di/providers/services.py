from dishka import Provider, Scope, provide_all, WithParents

from vnu.application.services.otp import OtpServiceImpl
from vnu.application.services.user import UserServiceImpl
from vnu.application.services.session import SessionServiceImpl


class ServiceProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[OtpServiceImpl],
        WithParents[UserServiceImpl],
        WithParents[SessionServiceImpl],
    )
