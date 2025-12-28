from typing import Optional
from uuid import UUID

from passlib.hash import bcrypt
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.controllers.users_controller import get_user_by_id
from api.models.user_model import User


async def get_user_by_email(email: str, db: AsyncSession) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def update_user_password(user_id: UUID, new_password: str, db: AsyncSession):
    user = await get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = bcrypt.hash(new_password)
    await db.commit()
    await db.refresh(user)
    return user
