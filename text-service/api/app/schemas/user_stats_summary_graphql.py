from uuid import UUID
from typing import Optional

import strawberry


@strawberry.input
class UserStatsSummaryCreateInput:
    user_id: UUID = strawberry.field(name="userId")
    total_sessions: Optional[int] = strawberry.field(default=0, name="totalSessions")
    total_practice_duration: Optional[int] = strawberry.field(default=0, name="totalPracticeDuration")
    average_wpm: Optional[float] = strawberry.field(default=0.0, name="averageWpm")
    average_accuracy: Optional[float] = strawberry.field(default=0.0, name="averageAccuracy")
    best_wpm: Optional[int] = strawberry.field(default=0, name="bestWpm")
    best_accuracy: Optional[float] = strawberry.field(default=0, name="bestAccuracy")


@strawberry.input
class UserStatsSummaryUpdateInput:
    user_id: UUID = strawberry.field(name="userId")
    total_sessions: Optional[int] = strawberry.field(default=None, name="totalSessions")
    total_practice_duration: Optional[int] = strawberry.field(default=None, name="totalPracticeDuration")
    average_wpm: Optional[float] = strawberry.field(default=None, name="averageWpm")
    average_accuracy: Optional[float] = strawberry.field(default=None, name="averageAccuracy")
    best_wpm: Optional[int] = strawberry.field(default=None, name="bestWpm")
    best_accuracy: Optional[float] = strawberry.field(default=None, name="bestAccuracy")


@strawberry.type
class UserStatsSummaryType:
    user_id: UUID = strawberry.field(name="userId")
    total_sessions: int = strawberry.field(name="totalSessions")
    total_practice_duration: int = strawberry.field(name="totalPracticeDuration")
    average_wpm: float = strawberry.field(name="averageWpm")
    average_accuracy: float = strawberry.field(name="averageAccuracy")
    best_wpm: int = strawberry.field(name="bestWpm")
    best_accuracy: int = strawberry.field(name="bestAccuracy")
