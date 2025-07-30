import strawberry


@strawberry.type
class DigraphType:
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
