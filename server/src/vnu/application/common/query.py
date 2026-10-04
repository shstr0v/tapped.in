from typing import Generic, TypeVar, Callable

InputDTO = TypeVar("InputDTO")
OutputDTO = TypeVar("OutputDTO")


class Query(Generic[InputDTO, OutputDTO]):
    async def __call__(self, data: InputDTO) -> OutputDTO:
        raise NotImplementedError


QueryT = TypeVar("QueryT")
QueryFactory = Callable[[], QueryT]
