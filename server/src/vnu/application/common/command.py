from typing import Callable, Generic, TypeVar

Input = TypeVar("Input")
Output = TypeVar("Output")


class Command(Generic[Input, Output]):
    async def __call__(self, data: Input) -> Output:
        raise NotImplementedError


CommandT = TypeVar("CommandT")
CommandFactory = Callable[[], CommandT]
