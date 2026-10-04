from dishka import AsyncContainer, make_async_container
from taskiq import TaskiqScheduler
from taskiq_redis import ListQueueBroker

from vnu.adapters.config import (
    AwsConfig,
    Config,
    DatabaseConfig,
    EmailConfig,
    MailchimpConfig,
    RedisConfig,
    SmsConfig,
)
from vnu.entrypoint.di.providers.adapters import AdaptersProvider
from vnu.entrypoint.di.providers.command import CommandProvider
from vnu.entrypoint.di.providers.dao import DAOProvider
from vnu.entrypoint.di.providers.db_connection import ConnectionProvider
from vnu.entrypoint.di.providers.interactors import InteractorsProvider
from vnu.entrypoint.di.providers.query import QueryProvider
from vnu.entrypoint.di.providers.repository import RepositoryProvider
from vnu.entrypoint.di.providers.services import ServiceProvider
from vnu.entrypoint.di.providers.tasks import TaskProvider


def get_async_container(
    config: Config,
    broker: ListQueueBroker | None = None,
    scheduler: TaskiqScheduler | None = None,
) -> AsyncContainer:
    context = {
        AwsConfig: config.aws,
        DatabaseConfig: config.database,
        EmailConfig: config.email,
        MailchimpConfig: config.mailchimp,
        RedisConfig: config.redis,
        SmsConfig: config.sms,
    }
    if broker is not None:
        context[ListQueueBroker] = broker
    if scheduler is not None:
        context[TaskiqScheduler] = scheduler

    providers = [
        AdaptersProvider(),
        ServiceProvider(),
        InteractorsProvider(),
        ConnectionProvider(),
        DAOProvider(),
        RepositoryProvider(),
        CommandProvider(),
        QueryProvider(),
    ]
    if broker is not None:
        providers.append(TaskProvider())

    container = make_async_container(*providers, context=context)

    return container
