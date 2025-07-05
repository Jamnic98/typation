from uuid import UUID

import strawberry


@strawberry.type
class DigraphType:
    id: UUID
    key: str
    count: int
    accuracy: int
    mean_interval: int


@strawberry.input
class DigraphInput:
    key: str
    count: int
    accuracy: int
    mean_interval: int
