from typing import Any

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import APIRouter, Request, Response, status

from vnu.application.dto.auth import EmailLoginDTO, PhoneLoginDTO, PhoneLoginVerifyDTO
from vnu.application.dto.user import SignUpDTO, VerifyPhoneDTO
from vnu.application.interactors.auth.email_login import EmailLogin
from vnu.application.interactors.auth.logout import Logout
from vnu.application.interactors.auth.phone_login import PhoneLogin
from vnu.application.interactors.auth.phone_login_verify import PhoneLoginVerify
from vnu.application.interactors.user import SignUp, VerifyPhone
from vnu.application.schemas.auth import (
    EmailLoginRequest,
    PhoneLoginRequest,
    PhoneLoginVerifyRequest,
    SignUpRequest,
    VerifyPhoneRequest,
)

SID_COOKIE = "sid"

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/phone/login")
@inject
async def phone_login(
    data: PhoneLoginRequest,
    interactor: FromDishka[PhoneLogin],
) -> Any:
    return await interactor(PhoneLoginDTO(phone=data.phone))


@router.post("/phone/verify")
@inject
async def phone_login_verify(
    data: PhoneLoginVerifyRequest,
    request: Request,
    response: Response,
    interactor: FromDishka[PhoneLoginVerify],
) -> Any:
    result = await interactor(
        PhoneLoginVerifyDTO(
            phone=data.phone,
            code=data.code,
            user_agent=request.headers.get("User-Agent", ""),
        )
    )
    response.set_cookie(SID_COOKIE, result.sid, httponly=True, samesite="lax")
    return result


@router.post("/email/login")
@inject
async def email_login(
    data: EmailLoginRequest,
    request: Request,
    response: Response,
    interactor: FromDishka[EmailLogin],
) -> Any:
    result = await interactor(
        EmailLoginDTO(
            email=str(data.email),
            raw_password=data.password,
            user_agent=request.headers.get("User-Agent", ""),
        )
    )
    response.set_cookie(SID_COOKIE, result.sid, httponly=True, samesite="lax")
    return result


@router.post("/signup", status_code=status.HTTP_201_CREATED)
@inject
async def sign_up(
    data: SignUpRequest,
    request: Request,
    response: Response,
    interactor: FromDishka[SignUp],
) -> Any:
    result = await interactor(
        SignUpDTO(
            email=str(data.email),
            phone=data.phone,
            age=data.age,
            user_agent=request.headers.get("User-Agent", ""),
            gender=data.gender,
            first_name=data.first_name,
            raw_password=data.password,
            last_name=data.last_name,
            telegram_id=data.telegram_id,
            username=data.username,
            avatar_url=data.avatar_url,
        )
    )
    response.set_cookie(SID_COOKIE, result.sid, httponly=True, samesite="lax")
    return result


@router.post("/phone/activate")
@inject
async def verify_phone(
    data: VerifyPhoneRequest,
    interactor: FromDishka[VerifyPhone],
) -> Any:
    return await interactor(VerifyPhoneDTO(code=data.code))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@inject
async def logout(
    response: Response,
    interactor: FromDishka[Logout],
) -> None:
    await interactor()
    response.delete_cookie(SID_COOKIE)
