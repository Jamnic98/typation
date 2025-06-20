from typing import Sequence
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
    except IntegrityError as e:
        print("IntegrityError:", e)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        ) from e

    print("Committed user:", user)
    await db.refresh(db_user)
    print("Refreshed user:", user)
    return db_user


async def get_user_by_id(user_id: UUID, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    return user


async def get_all_users(db: AsyncSession) -> Sequence[User]:
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


async def update_user(user: UserUpdate, user_id: UUID, db: AsyncSession) -> User | None:
    existing_user = await get_user_by_id(user_id, db)
    if not existing_user:
        return None

    update_data = user.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(existing_user, field, value)

    await db.commit()
    await db.refresh(existing_user)
    return existing_user


async def delete_user(user_id: UUID, db: AsyncSession) -> bool:
    user = await db.get(User, user_id)
    if not user:
        return False
    await db.delete(user)
    await db.commit()
    return True
