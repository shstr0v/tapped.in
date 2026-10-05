from dishka import Provider, Scope, WithParents, provide_all

from vnu.application.queries.music import (
    GetMusicProfileById,
    GetMyMusicProfile,
    GetRecommendationFeed,
    GetRecommendationScore,
    ListConnections,
    ListConversations,
    ListMessages,
    ListMyUploads,
    ListNotifications,
    ListReceivedFeedback,
    ListSavedProfiles,
)
from vnu.application.queries.user import GetMe


class QueryProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        WithParents[GetMusicProfileById],
        WithParents[GetMyMusicProfile],
        WithParents[GetRecommendationFeed],
        WithParents[GetRecommendationScore],
        WithParents[ListConnections],
        WithParents[ListConversations],
        WithParents[ListMessages],
        WithParents[ListMyUploads],
        WithParents[ListNotifications],
        WithParents[ListReceivedFeedback],
        WithParents[ListSavedProfiles],
        WithParents[GetMe],
    )
