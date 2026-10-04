import secrets

from vnu.application.common.auth.session import SessionProcessor

BYTES_COUNT = 32

class SessionProcessorImpl(SessionProcessor):
    def generate(self) -> str:
        return secrets.token_urlsafe(BYTES_COUNT)
