from dishka import Provider, Scope, provide_all, WithParents

from vnu.adapters.data.repository import (
    OtpRepositoryImpl,
    UserRepositoryImpl,
)


class RepositoryProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[OtpRepositoryImpl],
        WithParents[UserRepositoryImpl],
    )
