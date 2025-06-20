from uuid import UUID
from typing import Optional

import strawberry


@strawberry.input
class UserStatsSummaryCreateInput:
    user_id: UUID
    total_sessions: Optional[int] = 0
    total_practice_duration: Optional[int] = 0
    average_wpm: Optional[float] = 0.0
    average_accuracy: Optional[float] = 0.0
    best_wpm: Optional[int] = 0
    best_accuracy: Optional[int] = 0


@strawberry.input
class UserStatsSummaryUpdateInput:
    total_sessions: Optional[int] = None
    total_practice_duration: Optional[int] = None
    average_wpm: Optional[float] = None
    average_accuracy: Optional[float] = None
    best_wpm: Optional[int] = None
    best_accuracy: Optional[int] = None


@strawberry.type
class UserStatsSummaryType:
    user_id: UUID
    total_sessions: int
    total_practice_duration: int
    average_wpm: float
    average_accuracy: float
    best_wpm: int
    best_accuracy: int
