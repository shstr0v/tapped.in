from dishka import Provider, Scope, WithParents, provide_all

from vnu.adapters.tasks.email.publisher import OtpPublisherImpl


class TaskProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[OtpPublisherImpl],
    )
