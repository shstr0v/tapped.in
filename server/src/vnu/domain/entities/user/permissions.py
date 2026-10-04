from dataclasses import dataclass

from vnu.domain.entities.user.entity import User
from vnu.domain.services.authorization.base import Permission, PermissionContext


@dataclass(frozen=True)
class UserManagementContext(PermissionContext):
    subject: User
    target: User


@dataclass(frozen=True)
class CanManageUser(Permission[UserManagementContext]):
    context: UserManagementContext

    def is_satisfied(self) -> bool:
        return self.context.subject.id == self.context.target.id
