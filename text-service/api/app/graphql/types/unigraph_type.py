from uuid import UUID

import strawberry


@strawberry.type
class UnigraphType:
    id: UUID
    key: str
    count: int
    accuracy: int


@strawberry.input
class UnigraphInput:
    key: str
    count: int
    accuracy: int
