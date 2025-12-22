from sqlalchemy import Column, Integer, String, DateTime, func

from api.factories.database import Base


class WaitlistRequest(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# from pydantic import BaseModel, EmailStr
#
#
# class WaitlistRequest(BaseModel):
#     email: EmailStr