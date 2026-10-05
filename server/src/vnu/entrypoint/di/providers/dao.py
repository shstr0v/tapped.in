from dishka import Provider, Scope, WithParents, provide_all

from vnu.adapters.data.dao import (
    MusicDAOImpl,
    UserDAOImpl,
)


class DAOProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[MusicDAOImpl],
        WithParents[UserDAOImpl],
    )
