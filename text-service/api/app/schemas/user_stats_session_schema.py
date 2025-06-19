from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

class UserStatsSessionCreate(BaseModel):
    user_id: UUID
    wpm: Optional[int] = None
    accuracy: Optional[int] = None
    practice_duration: Optional[int] = None


class UserStatsSessionRead(BaseModel):
    id: UUID
    user_id: UUID
    wpm: Optional[int]
    accuracy: Optional[int]
    practice_duration: Optional[int]
    created_at: datetime
    ended_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
