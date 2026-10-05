from dishka import Provider, Scope, provide_all

from vnu.application.interactors.auth.email_login import EmailLogin
from vnu.application.interactors.auth.logout import Logout
from vnu.application.interactors.auth.phone_login import PhoneLogin
from vnu.application.interactors.auth.phone_login_verify import PhoneLoginVerify
from vnu.application.interactors.music import (
    AcceptConnection,
    CreateFeaturedUpload,
    CreateFeedback,
    DeleteUpload,
    MarkNotificationRead,
    RejectConnection,
    RequestConnection,
    SwipeProfile,
    UpdateMyMusicProfile,
    UpsertMyMusicProfile,
)
from vnu.application.interactors.otp.send import SendOtp
from vnu.application.interactors.user import CompleteUser, GetByUsername, SignUp, UpdateUser, VerifyPhone


class InteractorsProvider(Provider):
    scope = Scope.REQUEST

    provides = provide_all(
        EmailLogin,
        Logout,
        PhoneLogin,
        PhoneLoginVerify,
        SendOtp,
        AcceptConnection,
        CreateFeaturedUpload,
        CreateFeedback,
        DeleteUpload,
        MarkNotificationRead,
        RejectConnection,
        RequestConnection,
        SwipeProfile,
        UpdateMyMusicProfile,
        UpsertMyMusicProfile,
        CompleteUser,
        GetByUsername,
        SignUp,
        UpdateUser,
        VerifyPhone,
    )
