from fastapi import APIRouter, Request, Response, status
from dishka.integrations.fastapi import FromDishka, inject
from pydantic import BaseModel

from vnu.application.dto.auth import EmailLoginDTO, PhoneLoginDTO, PhoneLoginVerifyDTO
from vnu.application.dto.user import SignUpDTO, VerifyPhoneDTO
from vnu.application.interactors.auth.email_login import EmailLogin
from vnu.application.interactors.auth.logout import Logout
from vnu.application.interactors.auth.phone_login import PhoneLogin
from vnu.application.interactors.auth.phone_login_verify import PhoneLoginVerify
from vnu.application.interactors.user import SignUp, VerifyPhone
from vnu.domain.entities.user.enum import UserGenderEnum

SID_COOKIE = "sid"

router = APIRouter(prefix="/auth", tags=["auth"])


class PhoneLoginRequest(BaseModel):
    phone: str


class PhoneLoginVerifyRequest(BaseModel):
    phone: str
    code: str


class EmailLoginRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    phone: str
    age: int
    gender: UserGenderEnum
    first_name: str
    last_name: str
    password: str
    telegram_id: int | None = None
    username: str | None = None
    avatar_url: str | None = None


class VerifyPhoneRequest(BaseModel):
    code: str


@router.post("/phone/login")
@inject
async def phone_login(
    data: PhoneLoginRequest,
    interactor: FromDishka[PhoneLogin],
):
    return await interactor(PhoneLoginDTO(phone=data.phone))


@router.post("/phone/verify")
@inject
async def phone_login_verify(
    data: PhoneLoginVerifyRequest,
    request: Request,
    response: Response,
    interactor: FromDishka[PhoneLoginVerify],
):
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
):
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
):
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
):
    return await interactor(VerifyPhoneDTO(code=data.code))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@inject
async def logout(
    response: Response,
    interactor: FromDishka[Logout],
) -> None:
    await interactor()
    response.delete_cookie(SID_COOKIE)
