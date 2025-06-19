from datetime import datetime
from typing import Optional
from uuid import UUID

import strawberry


@strawberry.type
class UserStatsSessionType:
    id: UUID
    user_id: UUID
    wpm: Optional[int]
    accuracy: Optional[int]
    practice_duration: Optional[int]
    created_at: datetime
    ended_at: Optional[datetime]


@strawberry.input
class UserStatsSessionInput:
    user_id: UUID
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    practice_duration: Optional[int] = None
    ended_at: Optional[datetime] = None


@strawberry.input
class UserStatsSessionUpdateInput:
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    practice_duration: Optional[int] = None
