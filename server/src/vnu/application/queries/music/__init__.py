from vnu.application.queries.music.beats import GetBeat, ListMyBeats
from vnu.application.queries.music.connections import ListConnections
from vnu.application.queries.music.conversations import ListConversations, ListMessages
from vnu.application.queries.music.feedback import ListReceivedFeedback
from vnu.application.queries.music.notifications import ListNotifications
from vnu.application.queries.music.profile import GetMusicProfileById, GetMyMusicProfile
from vnu.application.queries.music.recommendations import GetRecommendationFeed, GetRecommendationScore
from vnu.application.queries.music.swipes import ListSavedProfiles
from vnu.application.queries.music.uploads import ListMyUploads

__all__ = [
    "GetBeat",
    "GetMusicProfileById",
    "GetMyMusicProfile",
    "GetRecommendationFeed",
    "GetRecommendationScore",
    "ListConnections",
    "ListConversations",
    "ListMessages",
    "ListMyBeats",
    "ListMyUploads",
    "ListNotifications",
    "ListReceivedFeedback",
    "ListSavedProfiles",
]
