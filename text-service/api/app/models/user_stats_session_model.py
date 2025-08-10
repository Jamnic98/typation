from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import ForeignKey, Integer, Float, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.dialects.postgresql import UUID

from ..factories.database import Base



class UserStatsSession(Base):
    __tablename__ = "user_stats_sessions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    wpm: Mapped[Optional[int]] = mapped_column(Integer)
    accuracy: Mapped[Optional[float]] = mapped_column(Float)
    practice_duration: Mapped[Optional[int]] = mapped_column(Integer)

    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()  # pylint: disable=not-callable
    )
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    corrected_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    deleted_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_keystrokes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")
