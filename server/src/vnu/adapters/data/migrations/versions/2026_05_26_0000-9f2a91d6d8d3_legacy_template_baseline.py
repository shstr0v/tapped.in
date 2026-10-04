"""legacy template baseline

Revision ID: 9f2a91d6d8d3
Revises:
Create Date: 2026-05-26 00:00:00.000000

"""
from typing import Sequence, Union

revision: str = "9f2a91d6d8d3"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Intentionally empty: keeps existing local DBs with old template revision upgradeable."""


def downgrade() -> None:
    """Intentionally empty."""

