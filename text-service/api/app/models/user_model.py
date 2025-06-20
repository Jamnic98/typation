from typing import Optional
from uuid import uuid4

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import Integer, Float, DateTime

from ..factories.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_name: Mapped[Optional[str]] = mapped_column(index=True)
    first_name: Mapped[Optional[str]] = mapped_column(index=True)
    last_name: Mapped[Optional[str]] = mapped_column(index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    sessions: Mapped[list["UserStatsSession"]] = relationship(
        "UserStatsSession", back_populates="user", cascade="all, delete"
    )
    summary: Mapped[Optional["UserStatsSummary"]] = relationship(
        "UserStatsSummary", uselist=False, back_populates="user", cascade="all, delete"
    )



class UserStatsSession(Base):
    __tablename__ = "user_stats_session"

    id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    wpm: Mapped[Optional[int]] = mapped_column(Integer)
    accuracy: Mapped[Optional[int]] = mapped_column(Integer)
    practice_duration: Mapped[Optional[int]] = mapped_column(Integer)  # milliseconds
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())  # pylint: disable=not-callable
    ended_at: Mapped[Optional[DateTime]] = mapped_column(DateTime)

    user: Mapped["User"] = relationship("User", back_populates="sessions")


class UserStatsSummary(Base):
    __tablename__ = "user_stats_summary"

    user_id: Mapped[uuid4] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    total_practice_duration: Mapped[int] = mapped_column(Integer, default=0)
    average_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    average_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    best_wpm: Mapped[int] = mapped_column(Integer, default=0)
    best_accuracy: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship("User", back_populates="summary")
