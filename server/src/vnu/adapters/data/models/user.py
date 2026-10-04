import uuid
from datetime import datetime

from sqlalchemy import TIMESTAMP, BigInteger, Enum, Integer, String, UUID
from sqlalchemy.orm import Mapped, mapped_column

from vnu.adapters.data.models.base import Base
from vnu.domain.entities.user.enum import UserStatusEnum


class UserModel(Base):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    telegram_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, unique=True)
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(16), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(15), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum(
            UserStatusEnum.ACTIVE.value,
            UserStatusEnum.GUEST.value,
            name="user_status_enum"
        ),
        nullable=False,
        default=UserStatusEnum.GUEST.value
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False
    )
