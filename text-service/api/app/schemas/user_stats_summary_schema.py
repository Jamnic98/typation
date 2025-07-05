from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Mapped, relationship


class UserStatsSummaryBase(BaseModel):
    total_sessions: Optional[int] = Field(0, ge=0)
    total_practice_duration: Optional[int] = Field(0, ge=0)
    average_wpm: Optional[int] = Field(0.0, ge=0.0)
    fastest_wpm: Optional[int] = Field(0, ge=0)
    average_accuracy: Optional[float] = Field(0.0, ge=0.0, le=100.0)

    unigraphs: Mapped[list["Unigraph"]] = relationship(
        "Unigraph", back_populates="summary", cascade="all, delete-orphan"
    )
    digraphs: Mapped[list["Digraph"]] = relationship(
        "Digraph", back_populates="summary", cascade="all, delete-orphan"
    )


class UserStatsSummaryCreate(UserStatsSummaryBase):
    user_id: UUID  # Required on create


class UserStatsSummaryUpdate(UserStatsSummaryBase):
    pass


class UserStatsSummaryOut(UserStatsSummaryBase):
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
