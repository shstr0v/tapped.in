from dishka import Provider, Scope, WithParents, provide_all

from vnu.adapters.data.repository import (
    MusicRepositoryImpl,
    OtpRepositoryImpl,
    UserRepositoryImpl,
)


class RepositoryProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[MusicRepositoryImpl],
        WithParents[OtpRepositoryImpl],
        WithParents[UserRepositoryImpl],
    )
