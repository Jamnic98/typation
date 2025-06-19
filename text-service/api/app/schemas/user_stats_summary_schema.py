from uuid import UUID
import strawberry


@strawberry.type
class UserStatsSummaryType:
    user_id: UUID
    total_sessions: int
    total_practice_duration: int
    average_wpm: float
    average_accuracy: float
    best_wpm: int
    best_accuracy: int
