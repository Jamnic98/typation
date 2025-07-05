from uuid import uuid4

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy import Integer, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..factories.database import Base
from ..graphql.types.digraph_type import DigraphType
from ..graphql.types.unigraph_type import UnigraphType
from ..schemas.user_graphql import UserType


class UserStatsSummary(Base):
    __tablename__ = "user_stats_summaries"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    total_sessions: Mapped[int] = mapped_column(Integer, default=1)
    total_practice_duration: Mapped[int] = mapped_column(Integer, default=0)

    average_wpm: Mapped[int] = mapped_column(Integer, default=0)
    average_accuracy: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    fastest_wpm: Mapped[int] = mapped_column(Integer, default=0)
    longest_consecutive_daily_practice_streak: Mapped[int] = mapped_column(Integer, default=0)

    total_corrected_char_count: Mapped[int] = mapped_column(Integer, nullable=True)
    total_deleted_char_count: Mapped[int] = mapped_column(Integer, nullable=True)
    total_keystrokes: Mapped[int] = mapped_column(Integer, nullable=True)
    total_char_count: Mapped[int] = mapped_column(Integer, nullable=True)
    error_char_count: Mapped[int] = mapped_column(Integer, nullable=True)

    unigraphs: Mapped[list[UnigraphType]] = relationship(
        "Unigraph", back_populates="summary", cascade="all, delete-orphan"
    )
    digraphs: Mapped[list[DigraphType]] = relationship(
        "Digraph", back_populates="summary", cascade="all, delete-orphan"
    )

    user: Mapped[UserType] = relationship("User", back_populates="summary")
