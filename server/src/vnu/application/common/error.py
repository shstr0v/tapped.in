class ApplicationError(Exception):
    def __init__(self, message: str | None = None) -> None:
        self.message = message
