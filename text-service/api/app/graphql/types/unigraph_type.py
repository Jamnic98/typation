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
    id: str
    key: str
    count: int
    accuracy: float

    # avoid name clash with the SQLAlchemy column
    @strawberry.field(name="mistyped")
    def mistyped_entries(self) -> list[MistypedEntryType]:
        raw = getattr(self, "__dict__", {}).get("mistyped", {})  # SQLAlchemy JSONB column
        return [MistypedEntryType(key=k, count=v) for k, v in (raw or {}).items()]

@strawberry.input
class UnigraphInput:
    key: str
    count: int
    accuracy: int
    mistyped: Optional[list[MistypedEntryInput]] = None
