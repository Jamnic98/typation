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

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
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
    __tablename__ = "user_stats_sessions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    wpm: Mapped[Optional[int]] = mapped_column(Integer)
    accuracy: Mapped[Optional[float]] = mapped_column(Float)  # <- corrected from Integer
    practice_duration: Mapped[Optional[int]] = mapped_column(Integer)  # milliseconds
    start_time: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()  # pylint: disable=not-callable
    )
    end_time: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))

    corrected_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    deleted_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    typed_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_char_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    unigraphs: Mapped[list["Unigraph"]] = relationship(
        "Unigraph", back_populates="session", cascade="all, delete-orphan"
    )
    digraphs: Mapped[list["Digraph"]] = relationship(
        "Digraph", back_populates="session", cascade="all, delete-orphan"
    )

    user: Mapped["User"] = relationship("User", back_populates="sessions")


class UserStatsSummary(Base):
    __tablename__ = "user_stats_summarys"

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    total_practice_duration: Mapped[int] = mapped_column(Integer, default=0)
    average_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    average_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    best_wpm: Mapped[int] = mapped_column(Integer, default=0)
    best_accuracy: Mapped[float] = mapped_column(Float, default=0)  # corrected from Integer

    user: Mapped["User"] = relationship("User", back_populates="summary")


class Unigraph(Base):
    __tablename__ = "unigraphs"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_stats_session_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_stats_sessions.id"), nullable=False
    )
    key: Mapped[str] = mapped_column(String, nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)

    session: Mapped["UserStatsSession"] = relationship("UserStatsSession", back_populates="unigraphs")


class Digraph(Base):
    __tablename__ = "digraphs"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_stats_session_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_stats_sessions.id"), nullable=False
    )
    key: Mapped[str] = mapped_column(String, nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    mean_interval: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    session: Mapped["UserStatsSession"] = relationship("UserStatsSession", back_populates="digraphs")
