from dishka import Provider, Scope, WithParents, provide_all

from vnu.application.queries.user import GetMe


class QueryProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[GetMe],
    )
