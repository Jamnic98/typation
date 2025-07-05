from uuid import UUID
from typing import Optional

import strawberry


@strawberry.type
class MistypedEntryType:
    key: str
    count: int


@strawberry.input
class MistypedEntryInput:
    key: str
    count: int


@strawberry.type
class UnigraphType:
    id: UUID
    key: str
    count: int
    accuracy: int

    @strawberry.field()
    def mistyped(self) -> list[MistypedEntryType]:
        # self is the SQLAlchemy model or a wrapper — adapt if you're using a wrapper
        return [
            MistypedEntryType(key=k, count=v)
            for k, v in self.mistyped.items()
        ]

@strawberry.input
class UnigraphInput:
    key: str
    count: int
    accuracy: int
    mistyped: Optional[list[MistypedEntryInput]] = None
