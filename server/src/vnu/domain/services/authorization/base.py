from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class PermissionContext(ABC):
    ...


@dataclass(frozen=True)
class Permission[PC: PermissionContext](ABC):
    context: PC

    @abstractmethod
    def is_satisfied(self) -> bool:
        raise NotImplementedError
