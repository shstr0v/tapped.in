from dishka import Provider, Scope, WithParents, provide_all

from vnu.application.commands.user import CreateGuestCommand


class CommandProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[CreateGuestCommand],
    )
