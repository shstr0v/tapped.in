from typing import Literal
from uuid import UUID

from jose import jwt, JWTError

Algorithm = Literal[
    "HS256", "HS384", "HS512",
    "RS256", "RS384", "RS512",
]


class TokenProcessor:
    def __init__(
        self,
        secret: str,
        algorithm: Algorithm,
    ) -> None:
        self.secret = secret
        self.algorithm = algorithm

    def create_access_token(
        self,
        user_id: UUID,
    ) -> str:
        to_encode = {"sub": str(user_id)}
        return jwt.encode(
            to_encode, self.secret, algorithm=self.algorithm,
        )

    def validate_token(self, token: str) -> UUID:
        try:
            payload = jwt.decode(
                token, self.secret, algorithms=[self.algorithm],
            )
        except JWTError:
            raise ValueError("Invalid token")
        try:
            return UUID(payload["sub"])
        except ValueError:
            raise ValueError("Invalid token")
