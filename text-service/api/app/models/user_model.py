from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column

from ..factories.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_name: Mapped[Optional[str]] = mapped_column(index=True)
    first_name: Mapped[Optional[str]] = mapped_column(index=True)
    last_name: Mapped[Optional[str]] = mapped_column(index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
