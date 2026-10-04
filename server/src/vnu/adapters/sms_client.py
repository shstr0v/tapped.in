import json
import logging
from aiohttp import ClientSession, ClientError

from vnu.application.common.sms_client import SmsClient, PhoneNumber, PinId
from vnu.application.errors.sms import SmsSendingError

logger = logging.getLogger(__name__)


class SmsClientImpl(SmsClient):
    def __init__(self, client: ClientSession) -> None:
        self.client = client

    async def send_otp(self, to: PhoneNumber, code: str) -> PinId:
        print(f"Sending OTP to {to} with code {code}", flush=True)
        payload = json.dumps({
            "type": "transactional",
            "unicodeEnabled": False,
            "content": f"Your verification code is {code}",
            "sender": "Flexxx",
            "recipient": to.replace("+", "")
        })
        print("PAYLOAD", payload, flush=True)
        try:
            response = await self.client.post(
                f"transactionalSMS/send",
                data=payload
            )
            print("RESPONSE", await response.json(), flush=True)
            response.raise_for_status()
        except ClientError as e:
            logger.error(f"Failed to send OTP: {e}")
            raise SmsSendingError("Failed to send OTP.")
