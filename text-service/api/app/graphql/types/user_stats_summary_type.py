from uuid import UUID
from typing import Optional

import strawberry

from .digraph_type import DigraphInput, DigraphType
from .unigraph_type import UnigraphType, UnigraphInput


@strawberry.input
class UserStatsSummaryCreateInput:
    # user_id: UUID = strawberry.field(name="userId")
    total_sessions: int = strawberry.field(default=0, name="totalSessions")
    total_practice_duration: int = strawberry.field(default=0, name="totalPracticeDuration")

    average_wpm: float = strawberry.field(default=0.0, name="averageWpm")
    average_accuracy: float = strawberry.field(default=0.0, name="averageAccuracy")
    fastest_wpm: int = strawberry.field(default=0, name="fastestWpm")
    longest_consecutive_daily_practice_streak: int = strawberry.field(default=0, name="longestStreak")

    total_corrected_char_count: int = strawberry.field(default=None, name="correctedCharCount")
    total_deleted_char_count: int = strawberry.field(default=None, name="deletedCharCount")
    total_keystrokes: int = strawberry.field(default=None, name="totalKeystrokes")
    total_char_count: int = strawberry.field(default=None, name="totalCharCount")
    error_char_count: int = strawberry.field(default=None, name="errorCharCount")

    unigraphs: list[UnigraphInput] = strawberry.field(default_factory=list)
    digraphs: list[DigraphInput] = strawberry.field(default_factory=list)


@strawberry.input
class UserStatsSummaryUpdateInput:
    total_sessions: Optional[int] = strawberry.field(default=None, name="totalSessions")
    total_practice_duration: Optional[int] = strawberry.field(default=None, name="totalPracticeDuration")

    average_wpm: Optional[int] = strawberry.field(default=None, name="averageWpm")
    average_accuracy: Optional[float] = strawberry.field(default=None, name="averageAccuracy")
    fastest_wpm: Optional[int] = strawberry.field(default=None, name="fastestWpm")
    longest_consecutive_daily_practice_streak: Optional[int] = strawberry.field(default=0, name="longestStreak")

    total_corrected_char_count: Optional[int] = strawberry.field(default=None, name="correctedCharCount")
    total_deleted_char_count: Optional[int] = strawberry.field(default=None, name="deletedCharCount")
    total_keystrokes: Optional[int] = strawberry.field(default=None, name="totalKeystrokes")
    total_char_count: Optional[int] = strawberry.field(default=None, name="totalCharCount")
    error_char_count: Optional[int] = strawberry.field(default=None, name="errorCharCount")

    unigraphs: Optional[list[UnigraphInput]] = strawberry.field(default=None)
    digraphs: Optional[list[DigraphInput]] = strawberry.field(default=None)


@strawberry.type
class UserStatsSummaryType:
    user_id: UUID = strawberry.field(name="userId")
    total_sessions: int = strawberry.field(name="totalSessions")
    total_practice_duration: int = strawberry.field(name="totalPracticeDuration")

    average_wpm: int = strawberry.field(name="averageWpm")
    average_accuracy: float = strawberry.field(name="averageAccuracy")
    fastest_wpm: int = strawberry.field(name="fastestWpm")
    longest_consecutive_daily_practice_streak: int = strawberry.field(
        name="longestConsecutiveDailyPracticeStreak"
    )

    total_corrected_char_count: int = strawberry.field(name="totalCorrectedCharCount")
    total_deleted_char_count: int = strawberry.field(name="totalDeletedCharCount")
    total_keystrokes: int = strawberry.field(name="totalKeystrokes")
    total_char_count: int = strawberry.field(name="totalCharCount")
    error_char_count: int = strawberry.field(name="errorCharCount")

    unigraphs: list[UnigraphType] = strawberry.field(name="unigraphs")
    digraphs: list[DigraphType] = strawberry.field(name="digraphs")
