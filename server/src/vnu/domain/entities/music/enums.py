from enum import Enum


class MusicProfileRoleEnum(Enum):
    ARTIST = "artist"
    PRODUCER = "producer"


class ExperienceLevelEnum(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    PRO = "pro"


class CollaborationStatusEnum(Enum):
    OPEN = "open"
    LOOKING_FOR_ARTISTS = "looking_for_artists"
    LOOKING_FOR_PRODUCERS = "looking_for_producers"
    CLOSED = "closed"


class SocialPlatformEnum(Enum):
    INSTAGRAM = "instagram"
    SPOTIFY = "spotify"
    SOUNDCLOUD = "soundcloud"
    YOUTUBE = "youtube"
    TELEGRAM = "telegram"
    OTHER = "other"


class SwipeActionEnum(Enum):
    SKIP = "skip"
    LIKE = "like"
    SAVE = "save"


class ConnectionStatusEnum(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class FeedbackCategoryEnum(Enum):
    PRODUCTION = "production"
    MIX = "mix"
    VOCALS = "vocals"
    FLOW = "flow"
    MELODY = "melody"
    ARRANGEMENT = "arrangement"
    ORIGINALITY = "originality"


class NotificationTypeEnum(Enum):
    CONNECTION_ACCEPTED = "connection_accepted"
    NEW_FEEDBACK = "new_feedback"


class MessageTypeEnum(Enum):
    TEXT = "text"
    BEAT = "beat"
