from dishka import Provider, Scope, WithParents, provide_all

from vnu.application.queries.music import (
    GetBeat,
    GetMusicProfileById,
    GetMyMusicProfile,
    GetRecommendationFeed,
    GetRecommendationScore,
    ListConnections,
    ListConversations,
    ListMessages,
    ListMyBeats,
    ListMyUploads,
    ListNotifications,
    ListReceivedFeedback,
    ListSavedProfiles,
)
from vnu.application.queries.user import GetMe


class QueryProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[GetBeat],
        WithParents[GetMusicProfileById],
        WithParents[GetMyMusicProfile],
        WithParents[GetRecommendationFeed],
        WithParents[GetRecommendationScore],
        WithParents[ListConnections],
        WithParents[ListConversations],
        WithParents[ListMessages],
        WithParents[ListMyBeats],
        WithParents[ListMyUploads],
        WithParents[ListNotifications],
        WithParents[ListReceivedFeedback],
        WithParents[ListSavedProfiles],
        WithParents[GetMe],
    )
