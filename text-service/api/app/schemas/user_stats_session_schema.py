from datetime import datetime
from typing import Optional, Dict
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UnigraphStatistic(BaseModel):
    count: int
    accuracy: int


class DigraphStatistic(BaseModel):
    count: int
    accuracy: int
    mean_interval: int


class UserStatsDetails(BaseModel):
    corrected_char_count: Optional[int] = None
    deleted_char_count: Optional[int] = None
    typed_char_count: Optional[int] = None
    total_char_count: Optional[int] = None
    error_char_count: Optional[int] = None

    unigraph_stats: Optional[Dict[str, UnigraphStatistic]] = None
    digraph_stats: Optional[Dict[str, DigraphStatistic]] = None


class UserStatsSessionCreate(BaseModel):
    wpm: Optional[int] = None
    accuracy: Optional[float] = None
    practice_duration: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    details: Optional[UserStatsDetails] = None


class UserStatsSessionRead(BaseModel):
    id: UUID
    user_id: UUID
    wpm: Optional[int]
    accuracy: Optional[float]
    practice_duration: Optional[int]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    details: Optional[UserStatsDetails] = None

    model_config = ConfigDict(from_attributes=True)
