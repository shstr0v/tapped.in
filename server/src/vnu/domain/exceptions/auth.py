from vnu.domain.common.exception import DomainError, ValidationError


class NoAttemptsLeftError(DomainError):
    ...


class ExpiredPasscodeError(DomainError):
    ...


class PasscodeMismatchError(DomainError):
    ...


class InvalidRateLimitError(ValidationError):
    ...


class InvalidVerificationCodeError(ValidationError):
    ...


class InvalidRawPasscodeError(ValidationError):
    ...


class AuthorizationError(DomainError):
    ...
