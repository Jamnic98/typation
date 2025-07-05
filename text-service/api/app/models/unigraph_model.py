import uuid
from sqlalchemy import String, Integer, Float, ForeignKey, UniqueConstraint, Column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.mutable import MutableDict

from ..factories.database import Base
from ..graphql.types.user_stats_summary_type import UserStatsSummaryType


class Unigraph(Base):
    __tablename__ = "unigraphs"
    __table_args__ = (
        UniqueConstraint('user_stats_summary_id', 'key', name='uq_summary_key'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_stats_summary_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_stats_summaries.id"), nullable=False
    )

    key: Mapped[str] = mapped_column(String(length=1), nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)

    mistyped = Column(MutableDict.as_mutable(JSONB), default=MutableDict)

    summary: Mapped[UserStatsSummaryType] = relationship("UserStatsSummary", back_populates="unigraphs")
