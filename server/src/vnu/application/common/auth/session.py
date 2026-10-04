from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from vnu.application.dto.session import (
    CreateSessionDTO,
    SessionDTO,
    GetSessionDTO,
    DeleteSessionDTO,
    RefreshSessionDTO,
    GetAllUserSessionsDTO,
    TerminateAllUserSessionsDTO,
    CompareUserAgentDTO,
    ValidateSessionDTO,
)


class SessionProcessor(Protocol):
    @abstractmethod
    def generate(self) -> str:
        raise NotImplementedError


class SessionDAO(Protocol):
    @abstractmethod
    async def create(self, data: SessionDTO, ttl: int) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get(self, data: GetSessionDTO) -> SessionDTO | None:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, data: DeleteSessionDTO) -> None:
        raise NotImplementedError
    
    @abstractmethod
    async def update(self, data: SessionDTO, ttl: int) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_all(self, user_id: UUID) -> list[SessionDTO]:
        raise NotImplementedError
    
    @abstractmethod
    async def delete_all(self, user_id: UUID) -> None:
        raise NotImplementedError


class SessionService(Protocol):
    @abstractmethod
    async def create(self, data: CreateSessionDTO) -> SessionDTO:
        raise NotImplementedError

    @abstractmethod
    async def get(self, data: GetSessionDTO) -> SessionDTO:
        raise NotImplementedError

    @abstractmethod
    async def terminate(self, data: DeleteSessionDTO) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_all(self, data: GetAllUserSessionsDTO) -> list[SessionDTO]:
        raise NotImplementedError
    
    @abstractmethod
    async def terminate_all(self, data: TerminateAllUserSessionsDTO) -> None:
        raise NotImplementedError

    @abstractmethod
    async def compare_user_agent(self, data: CompareUserAgentDTO) -> bool:
        raise NotImplementedError
    
    @abstractmethod
    async def refresh(self, data: RefreshSessionDTO) -> SessionDTO:
        raise NotImplementedError

    @abstractmethod
    async def validate(self, data: ValidateSessionDTO) -> SessionDTO:
        raise NotImplementedError