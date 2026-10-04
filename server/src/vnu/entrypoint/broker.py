import logging

from dishka.integrations.taskiq import setup_dishka
from taskiq import AsyncBroker, ScheduleSource, TaskiqScheduler
from taskiq_redis import ListQueueBroker, ListRedisScheduleSource, RedisAsyncResultBackend

from vnu.adapters.config import Config
from vnu.adapters.tasks.register import register_tasks
from vnu.entrypoint.di.container import get_async_container


def create_broker(config: Config) -> ListQueueBroker:
    return ListQueueBroker(config.redis.connection_url).with_result_backend(
        RedisAsyncResultBackend(redis_url=config.redis.connection_url)
    )


def create_scheduler(broker: AsyncBroker, sources: list[ScheduleSource]) -> TaskiqScheduler:
    return TaskiqScheduler(
        broker=broker,
        sources=sources,
    )


def configure_broker(config: Config, broker: AsyncBroker, scheduler: TaskiqScheduler) -> None:
    register_tasks(broker)
    container = get_async_container(config=config, broker=broker, scheduler=scheduler)
    setup_dishka(container=container, broker=broker)
    logging.info("Taskiq broker configured")


def get_scheduler_sources(config: Config) -> list[ScheduleSource]:
    return [ListRedisScheduleSource(config.redis.connection_url)]


def setup_taskiq_broker() -> AsyncBroker:
    config = Config.load_from_environment()
    broker = create_broker(config)
    scheduler = create_scheduler(broker, sources=get_scheduler_sources(config))
    configure_broker(config=config, broker=broker, scheduler=scheduler)
    return broker


def setup_taskiq_scheduler() -> TaskiqScheduler:
    config = Config.load_from_environment()
    broker = create_broker(config=config)
    return create_scheduler(broker, get_scheduler_sources(config))
