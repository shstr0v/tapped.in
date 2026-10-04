from importlib import import_module

_EXPORTS = {
    "OtpRepositoryImpl": "vnu.adapters.data.repository.otp",
    "UserRepositoryImpl": "vnu.adapters.data.repository.user",
}

__all__ = list(_EXPORTS)


def __getattr__(name: str):
    if name not in _EXPORTS:
        raise AttributeError(name)
    module = import_module(_EXPORTS[name])
    return getattr(module, name)
