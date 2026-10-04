from taskiq import AsyncBroker

from vnu.adapters.tasks.email.const import SEND_OTP_TASK_NAME
from vnu.adapters.tasks.email.jobs import send_otp


def register_tasks(broker: AsyncBroker) -> None:
    broker.register_task(send_otp, task_name=SEND_OTP_TASK_NAME)
