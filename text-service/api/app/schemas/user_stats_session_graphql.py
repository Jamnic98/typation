from datetime import datetime
from typing import Optional
from uuid import UUID

import strawberry


@strawberry.type
class UserStatsSessionType:
    id: UUID

    user_id: UUID = strawberry.field(name="userId")
    wpm: Optional[int]
    accuracy: Optional[int]

    practice_duration: Optional[int] = strawberry.field(name="practiceDuration")
    created_at: datetime = strawberry.field(name="createdAt")
    ended_at: Optional[datetime] = strawberry.field(name="endedAt")


@strawberry.input
class UserStatsSessionInput:
    user_id: UUID = strawberry.field(name="userId")
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)
    ended_at: Optional[datetime] = strawberry.field(name="endedAt", default=None)


@strawberry.input
class UserStatsSessionUpdateInput:
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)
