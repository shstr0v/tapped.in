"""add tappedin mvp

Revision ID: a1b2c3d4e5f6
Revises: 9f2a91d6d8d3
Create Date: 2026-10-04 15:30:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "9f2a91d6d8d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


music_profile_role_enum = postgresql.ENUM("artist", "producer", name="music_profile_role_enum", create_type=False)
music_experience_level_enum = postgresql.ENUM(
    "beginner",
    "intermediate",
    "advanced",
    "pro",
    name="music_experience_level_enum",
    create_type=False,
)
collaboration_status_enum = postgresql.ENUM(
    "open",
    "looking_for_artists",
    "looking_for_producers",
    "closed",
    name="collaboration_status_enum",
    create_type=False,
)
social_platform_enum = postgresql.ENUM(
    "instagram",
    "spotify",
    "soundcloud",
    "youtube",
    "other",
    name="social_platform_enum",
    create_type=False,
)
swipe_action_enum = postgresql.ENUM("skip", "like", "save", name="swipe_action_enum", create_type=False)
connection_status_enum = postgresql.ENUM(
    "pending",
    "accepted",
    "rejected",
    name="connection_status_enum",
    create_type=False,
)
feedback_category_enum = postgresql.ENUM(
    "production",
    "mix",
    "vocals",
    "flow",
    "melody",
    "arrangement",
    "originality",
    name="feedback_category_enum",
    create_type=False,
)
notification_type_enum = postgresql.ENUM(
    "connection_accepted",
    "new_feedback",
    name="notification_type_enum",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE user_status_enum AS ENUM ('active', 'guest');
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END $$;
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "user" (
            id UUID PRIMARY KEY,
            telegram_id BIGINT UNIQUE,
            username VARCHAR(64),
            first_name VARCHAR(80),
            last_name VARCHAR(80),
            age INTEGER,
            gender VARCHAR(16),
            avatar_url VARCHAR(2048),
            email VARCHAR(150),
            hashed_password VARCHAR(255),
            phone VARCHAR(15),
            status user_status_enum NOT NULL DEFAULT 'guest',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
        """
    )

    for enum in (
        music_profile_role_enum,
        music_experience_level_enum,
        collaboration_status_enum,
        social_platform_enum,
        swipe_action_enum,
        connection_status_enum,
        feedback_category_enum,
        notification_type_enum,
    ):
        enum.create(bind, checkfirst=True)

    op.create_table(
        "music_profile",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("role", music_profile_role_enum, nullable=False),
        sa.Column("artist_name", sa.String(length=80), nullable=False),
        sa.Column("avatar_url", sa.String(length=2048), nullable=True),
        sa.Column("location", sa.String(length=120), nullable=True),
        sa.Column("experience_level", music_experience_level_enum, nullable=False),
        sa.Column("bio", sa.String(length=500), nullable=True),
        sa.Column("collaboration_status", collaboration_status_enum, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_table(
        "music_identity",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("profile_id", sa.UUID(), nullable=False),
        sa.Column("genres", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("influences", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("type_beats", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("moods", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("bpm_min", sa.Integer(), nullable=True),
        sa.Column("bpm_max", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("profile_id"),
    )
    op.create_table(
        "social_link",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("profile_id", sa.UUID(), nullable=False),
        sa.Column("platform", social_platform_enum, nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("profile_id", "platform", name="uq_social_link_profile_platform"),
    )
    op.create_table(
        "music_upload",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("profile_id", sa.UUID(), nullable=False),
        sa.Column("audio_url", sa.String(length=2048), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("genre", sa.String(length=80), nullable=True),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("bpm", sa.Integer(), nullable=True),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "swipe",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("actor_profile_id", sa.UUID(), nullable=False),
        sa.Column("target_profile_id", sa.UUID(), nullable=False),
        sa.Column("action", swipe_action_enum, nullable=False),
        sa.Column("match_score", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.CheckConstraint("actor_profile_id <> target_profile_id", name="ck_swipe_not_self"),
        sa.ForeignKeyConstraint(["actor_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("actor_profile_id", "target_profile_id", name="uq_swipe_actor_target"),
    )
    op.create_table(
        "connection",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("requester_profile_id", sa.UUID(), nullable=False),
        sa.Column("receiver_profile_id", sa.UUID(), nullable=False),
        sa.Column("pair_first_profile_id", sa.UUID(), nullable=False),
        sa.Column("pair_second_profile_id", sa.UUID(), nullable=False),
        sa.Column("status", connection_status_enum, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.CheckConstraint("requester_profile_id <> receiver_profile_id", name="ck_connection_not_self"),
        sa.ForeignKeyConstraint(["pair_first_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["pair_second_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["receiver_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["requester_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pair_first_profile_id", "pair_second_profile_id", name="uq_connection_profile_pair"),
    )
    op.create_table(
        "feedback",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("author_profile_id", sa.UUID(), nullable=False),
        sa.Column("target_upload_id", sa.UUID(), nullable=False),
        sa.Column("category", feedback_category_enum, nullable=False),
        sa.Column("quick_reaction", sa.String(length=40), nullable=True),
        sa.Column("text", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.CheckConstraint("author_profile_id IS NOT NULL", name="ck_feedback_author_present"),
        sa.ForeignKeyConstraint(["author_profile_id"], ["music_profile.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_upload_id"], ["music_upload.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "notification",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("type", notification_type_enum, nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    for table_name in (
        "notification",
        "feedback",
        "connection",
        "swipe",
        "music_upload",
        "social_link",
        "music_identity",
        "music_profile",
    ):
        op.drop_table(table_name)

    bind = op.get_bind()
    for enum in (
        notification_type_enum,
        feedback_category_enum,
        connection_status_enum,
        swipe_action_enum,
        social_platform_enum,
        collaboration_status_enum,
        music_experience_level_enum,
        music_profile_role_enum,
    ):
        enum.drop(bind, checkfirst=True)
