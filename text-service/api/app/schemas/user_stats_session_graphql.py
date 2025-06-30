from typing import Optional, List
from uuid import UUID

import strawberry


@strawberry.input
class UserStatsSessionUpdateInput:
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)


@strawberry.input
class UnigraphStatisticInput:
    count: int
    accuracy: float  # Assuming you want decimal support


@strawberry.input
class DigraphStatisticInput:
    count: int
    accuracy: float


@strawberry.input
class KeyValueInput:
    key: str
    value: UnigraphStatisticInput  # or DigraphStatisticInput


@strawberry.input
class UnigraphStatEntryInput:
    key: str
    count: int
    accuracy: float


@strawberry.input
class DigraphStatEntryInput:
    key: str
    count: int
    accuracy: float


@strawberry.input
class DigraphTimingEntryInput:
    key: str
    intervals: List[int]


@strawberry.type
class UnigraphStatisticType:
    count: int
    accuracy: float


@strawberry.type
class DigraphStatisticType:
    count: int
    accuracy: float


@strawberry.input
class UserStatsDetailInput:
    corrected_char_count: Optional[int] = strawberry.field(name="correctedCharCount", default=None)
    deleted_char_count: Optional[int] = strawberry.field(name="deletedCharCount", default=None)
    typed_char_count: Optional[int] = strawberry.field(name="typedCharCount", default=None)
    total_char_count: Optional[int] = strawberry.field(name="totalCharCount", default=None)
    error_char_count: Optional[int] = strawberry.field(name="errorCharCount", default=None)

    # Dicts for stats
    unigraph_stats: Optional[List[UnigraphStatEntryInput]] = strawberry.field(name="unigraphStats", default=None)
    digraph_stats: Optional[List[DigraphStatEntryInput]] = strawberry.field(name="digraphStats", default=None)

    # Dict for timings (string → list of intervals)
    digraph_timings: Optional[List[DigraphTimingEntryInput]] = strawberry.field(name="digraphTimings", default=None)


@strawberry.type
class UserStatsSessionType:
    id: UUID

    user_id: UUID = strawberry.field(name="userId")
    wpm: Optional[int]
    accuracy: Optional[int]
    error_count: Optional[int] = strawberry.field(name="errorCount", default=None)

    start_time: Optional[float] = strawberry.field(name="startTime", default=None)
    end_time: Optional[float] = strawberry.field(name="endTime", default=None)
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration")


@strawberry.input
class UserStatsSessionInput:
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    digraph_stats: Optional[List[DigraphStatEntryInput]] = strawberry.field(name="digraphStats", default=None)
    digraph_timings: Optional[List[DigraphTimingEntryInput]] = strawberry.field(name="digraphTimings", default=None)
    start_time: Optional[float] = strawberry.field(name="startTime", default=None)  # Unix timestamp in ms
    end_time: Optional[float] = strawberry.field(name="endTime", default=None)
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)
    details: Optional[UserStatsDetailInput] = strawberry.field(default=None)



@strawberry.type
class UserStatsDetailType:
    corrected_char_count: Optional[int] = strawberry.field(name="correctedCharCount")
    deleted_char_count: Optional[int] = strawberry.field(name="deletedCharCount")
    typed_char_count: Optional[int] = strawberry.field(name="typedCharCount")
    total_char_count: Optional[int] = strawberry.field(name="totalCharCount")
    error_char_count: Optional[int] = strawberry.field(name="errorCharCount")

    digraph_timings: Optional[List[DigraphTimingEntryInput]] = strawberry.field(name="digraphTimings", default=None)
    unigraph_stats: Optional[List[UnigraphStatisticType]] = strawberry.field(name="unigraphStats", default=None)
    digraph_stats: Optional[List[DigraphStatisticType]] = strawberry.field(name="digraphStats", default=None)
