"""add direct messages

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-10-05 06:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

message_type_enum = postgresql.ENUM("text", "beat", name="message_type_enum", create_type=False)


def upgrade() -> None:
    op.execute("CREATE TYPE message_type_enum AS ENUM ('text', 'beat')")
    op.create_table(
        "conversation",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_1_id", sa.UUID(), nullable=False),
        sa.Column("user_2_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("last_message_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint("user_1_id::text < user_2_id::text", name="ck_conversation_user_order"),
        sa.ForeignKeyConstraint(["user_1_id"], ["user.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_2_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_1_id", "user_2_id", name="uq_conversation_user_pair"),
    )
    op.create_index("ix_conversation_user_1_id", "conversation", ["user_1_id"])
    op.create_index("ix_conversation_user_2_id", "conversation", ["user_2_id"])
    op.create_index("ix_conversation_last_message_at", "conversation", ["last_message_at"])
    op.create_table(
        "message",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("sender_id", sa.UUID(), nullable=False),
        sa.Column("type", message_type_enum, nullable=False),
        sa.Column("text", sa.String(length=2000), nullable=True),
        sa.Column("beat_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("read_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint(
            "(type = 'text' AND text IS NOT NULL AND btrim(text) <> '' AND beat_id IS NULL) "
            "OR (type = 'beat' AND text IS NULL)",
            name="ck_message_payload",
        ),
        sa.ForeignKeyConstraint(["beat_id"], ["music_upload.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversation.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_message_conversation_created_at", "message", ["conversation_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_message_conversation_created_at", table_name="message")
    op.drop_table("message")
    op.drop_index("ix_conversation_last_message_at", table_name="conversation")
    op.drop_index("ix_conversation_user_2_id", table_name="conversation")
    op.drop_index("ix_conversation_user_1_id", table_name="conversation")
    op.drop_table("conversation")
    op.execute("DROP TYPE IF EXISTS message_type_enum")
