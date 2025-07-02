from typing import Optional, List
from uuid import UUID

import strawberry


@strawberry.input
class UserStatsSessionUpdateInput:
    wpm: Optional[int] = None
    accuracy: Optional[float] = None
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)


@strawberry.input
class UnigraphStatisticInput:
    count: int
    accuracy: int  # Assuming you want decimal support


@strawberry.input
class DigraphStatisticInput:
    count: int
    accuracy: int


@strawberry.input
class KeyValueInput:
    key: str
    value: UnigraphStatisticInput  # or DigraphStatisticInput


@strawberry.input
class UnigraphStatEntryInput:
    key: str
    count: int
    accuracy: int


@strawberry.input
class DigraphStatEntryInput:
    key: str
    count: int
    accuracy: int
    mean_interval: int = strawberry.field(name="meanInterval")


@strawberry.type
class UnigraphStatisticType:
    count: int
    accuracy: int


@strawberry.type
class DigraphStatisticType:
    count: int
    accuracy: int
    mean_interval: int


@strawberry.input
class UserStatsDetailInput:
    corrected_char_count: Optional[int] = strawberry.field(name="correctedCharCount", default=None)
    deleted_char_count: Optional[int] = strawberry.field(name="deletedCharCount", default=None)
    typed_char_count: Optional[int] = strawberry.field(name="correctCharsTyped", default=None)
    total_chars_typed: Optional[int] = strawberry.field(name="totalCharsTyped", default=None)
    error_char_count: Optional[int] = strawberry.field(name="errorCharCount", default=None)

    # Dicts for stats
    unigraph_stats: Optional[List[UnigraphStatEntryInput]] = strawberry.field(name="unigraphStats", default=None)
    digraph_stats: Optional[List[DigraphStatEntryInput]] = strawberry.field(name="digraphStats", default=None)


@strawberry.type
class UserStatsSessionType:
    id: UUID

    user_id: UUID = strawberry.field(name="userId")
    wpm: Optional[int]
    accuracy: Optional[float]
    error_count: Optional[int] = strawberry.field(name="errorCount", default=None)

    start_time: Optional[float] = strawberry.field(name="startTime", default=None)
    end_time: Optional[float] = strawberry.field(name="endTime", default=None)
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration")


@strawberry.input
class UserStatsSessionInput:
    wpm: Optional[int] = None
    accuracy: Optional[float] = None

    unigraph_stats: Optional[List[DigraphStatEntryInput]] = strawberry.field(name="unigraphStats", default=None)
    digraph_stats: Optional[List[DigraphStatEntryInput]] = strawberry.field(name="digraphStats", default=None)

    start_time: Optional[float] = strawberry.field(name="startTime", default=None)  # Unix timestamp in ms
    end_time: Optional[float] = strawberry.field(name="endTime", default=None)
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)
    details: Optional[UserStatsDetailInput] = strawberry.field(default=None)



@strawberry.type
class UserStatsDetailType:
    corrected_char_count: Optional[int] = strawberry.field(name="correctedCharCount")
    deleted_char_count: Optional[int] = strawberry.field(name="deletedCharCount")
    typed_char_count: Optional[int] = strawberry.field(name="correctCharsTyped")
    total_char_count: Optional[int] = strawberry.field(name="totalCharsTyped")
    error_char_count: Optional[int] = strawberry.field(name="errorCharCount")

    unigraph_stats: Optional[List[UnigraphStatisticType]] = strawberry.field(name="unigraphStats", default=None)
    digraph_stats: Optional[List[DigraphStatisticType]] = strawberry.field(name="digraphStats", default=None)
