from typing import Optional
from uuid import uuid4

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

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
