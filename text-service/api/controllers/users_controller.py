from typing import Sequence, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models.user_model import User
from ..schemas.user_schema import UserCreate, UserUpdate


async def create_user(user: UserCreate, db: AsyncSession) -> User:
    db_user = User(**user.model_dump())
    db.add(db_user)
    try:
        await db.commit()
        await db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        ) from e


async def get_user_by_id(user_id: UUID, db: AsyncSession) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def get_all_users(db: AsyncSession) -> Sequence[User]:
    result = await db.execute(select(User))
    return result.scalars().all()


async def update_user(user: UserUpdate, user_id: UUID, db: AsyncSession) -> Optional[User]:
    existing_user: User = await get_user_by_id(user_id, db)
    if existing_user is None:
        return None

    for field, value in user.model_dump(exclude_unset=True).items():
        setattr(existing_user, field, value)

    try:
        await db.commit()
        await db.refresh(existing_user)
        return existing_user
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        ) from e


async def delete_user(user_id: UUID, db: AsyncSession) -> bool:
    user = await db.get(User, user_id)
    if user is None:
        return False
    await db.delete(user)
    await db.commit()
    return True
