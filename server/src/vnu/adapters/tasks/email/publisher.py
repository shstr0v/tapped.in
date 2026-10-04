from taskiq_redis import ListQueueBroker

from vnu.adapters.tasks.email.const import SEND_OTP_TASK_NAME
from vnu.adapters.tasks.email.jobs import send_otp
from vnu.application.common.otp.publisher import OtpPublisher
from vnu.application.dto.otp import SendOtpDTO


class OtpPublisherImpl(OtpPublisher):
    def __init__(self, broker: ListQueueBroker) -> None:
        self.broker = broker

    async def publish(self, data: SendOtpDTO) -> None:
        task = self.broker.task(task_name=SEND_OTP_TASK_NAME)(send_otp)
        await task.kiq(data=data)
