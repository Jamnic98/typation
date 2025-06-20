from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class UserStatsSummaryBase(BaseModel):
    total_sessions: Optional[int] = Field(0, ge=0)
    total_practice_duration: Optional[int] = Field(0, ge=0)
    average_wpm: Optional[float] = Field(0.0, ge=0.0)
    average_accuracy: Optional[float] = Field(0.0, ge=0.0, le=100.0)
    best_wpm: Optional[int] = Field(0, ge=0)
    best_accuracy: Optional[int] = Field(0, ge=0, le=100)


class UserStatsSummaryCreate(UserStatsSummaryBase):
    user_id: UUID  # Required on create


class UserStatsSummaryUpdate(UserStatsSummaryBase):
    # All optional on update, so no user_id here
    pass


class UserStatsSummaryOut(UserStatsSummaryBase):
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
