from types import SimpleNamespace
from uuid import uuid4

import pytest
from starlette.requests import Request

from vnu.adapters.auth.idp import SessionIdProvider
from vnu.application.errors.auth import UnauthorizedError


class FakeSessionService:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.validated_sids: list[str] = []

    async def validate(self, data: object) -> SimpleNamespace:
        self.validated_sids.append(data.session_id)
        return SimpleNamespace(user_id=self.user_id)


def _request(headers: dict[str, str]) -> Request:
    raw_headers = [(key.lower().encode(), value.encode()) for key, value in headers.items()]
    return Request({"type": "http", "headers": raw_headers})


@pytest.mark.asyncio
async def test_idp_reads_sid_from_bearer_header() -> None:
    service = FakeSessionService()
    idp = SessionIdProvider(_request({"Authorization": "Bearer sid-1"}), service)

    user_id = await idp.get_current_id()

    assert user_id.value == service.user_id
    assert service.validated_sids == ["sid-1"]
    assert idp.get_current_sid() == "sid-1"


@pytest.mark.asyncio
async def test_idp_prefers_cookie_over_bearer_header() -> None:
    service = FakeSessionService()
    idp = SessionIdProvider(_request({"Cookie": "sid=cookie-sid", "Authorization": "Bearer other"}), service)

    await idp.get_current_id()

    assert service.validated_sids == ["cookie-sid"]


@pytest.mark.asyncio
async def test_idp_rejects_missing_or_malformed_credentials() -> None:
    for headers in ({}, {"Authorization": "Basic abc"}, {"Authorization": "Bearer"}):
        idp = SessionIdProvider(_request(headers), FakeSessionService())
        with pytest.raises(UnauthorizedError):
            await idp.get_current_id()
