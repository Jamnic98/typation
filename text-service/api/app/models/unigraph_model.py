import uuid

from sqlalchemy import ForeignKey, Integer, Float, UUID, String, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..factories.database import Base


class Unigraph(Base):
    __tablename__ = "unigraphs"

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    user_stats_summary_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_stats_summaries.id"),
        primary_key=True,
        nullable=False,
    )
    key: Mapped[str] = mapped_column(String(length=1), primary_key=True, nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)

    summary: Mapped["UserStatsSummary"] = relationship("UserStatsSummary", back_populates="unigraphs")
