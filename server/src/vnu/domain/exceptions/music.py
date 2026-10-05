from vnu.domain.common.exception import ValidationError


class InvalidMusicProfileError(ValidationError): ...


class InvalidMusicUploadError(ValidationError): ...


class InvalidMusicInteractionError(ValidationError): ...
