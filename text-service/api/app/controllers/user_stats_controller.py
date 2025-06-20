from uuid import UUID
from typing import  Optional,Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.user_model import UserStatsSession
from ..schemas.user_stats_session_graphql import UserStatsSessionUpdateInput
from ..schemas.user_stats_session_schema import UserStatsSessionCreate


async def create_user_stats_session(db: AsyncSession, session_data: UserStatsSessionCreate) -> UserStatsSession:
    new_session = UserStatsSession(
        user_id=session_data.user_id,
        wpm=session_data.wpm,
        accuracy=session_data.accuracy,
        practice_duration=session_data.practice_duration,
        ended_at=getattr(session_data, "ended_at", None),  # Optional
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session


async def get_user_stats_session_by_id(
    db: AsyncSession, session_id: UUID
) -> Optional[UserStatsSession]:
    return await db.get(UserStatsSession, session_id)


async def get_all_user_stats_sessions(
    db: AsyncSession
) -> Sequence[UserStatsSession]:
    result = await db.execute(select(UserStatsSession))
    return result.scalars().all()


async def update_user_stats_session(
    db: AsyncSession, session_id: UUID, update_data: UserStatsSessionUpdateInput
) -> type[UserStatsSession] | None:
    session = await db.get(UserStatsSession, session_id)
    if not session:
        return None

    update_fields = {
        field: value for field, value in update_data.__dict__.items()
        if value is not None
    }
    for field, value in update_fields.items():
        setattr(session, field, value)

    await db.commit()
    await db.refresh(session)
    return session


async def delete_user_stats_session(
    db: AsyncSession, session_id: UUID
) -> bool:
    session = await db.get(UserStatsSession, session_id)
    if not session:
        return False

    await db.delete(session)
    await db.commit()
    return True
