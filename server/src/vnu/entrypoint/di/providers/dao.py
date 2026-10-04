from dishka import Provider, Scope, provide_all, WithParents

from vnu.adapters.data.dao import (
    UserDAOImpl,
)


class DAOProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[UserDAOImpl],
    )
