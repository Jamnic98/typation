from uuid import UUID
from typing import  Optional,Sequence

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..factories.database import get_db
from ..models.user_model import UserStatsSession, Digraph, Unigraph
from ..schemas.user_stats_session_graphql import UserStatsSessionUpdateInput
from ..schemas.user_stats_session_schema import UserStatsSessionCreate


async def create_user_stats_session(
    user_id: UUID,
    input_data: UserStatsSessionCreate,
    db: AsyncSession = Depends(get_db)
) -> UserStatsSession:
    # Create full model with user_id from context
    session_data = UserStatsSessionCreate(
        wpm=input_data.wpm,
        accuracy=input_data.accuracy,
        practice_duration=input_data.practice_duration,
        start_time=input_data.start_time,
        end_time=input_data.end_time,
        corrected_char_count=input_data.corrected_char_count,
        deleted_char_count=input_data.deleted_char_count,
        total_char_count=input_data.total_char_count,
        error_char_count=input_data.error_char_count,
    )

    new_session = UserStatsSession(
        user_id=user_id,
        wpm=session_data.wpm,
        accuracy=session_data.accuracy,
        practice_duration=session_data.practice_duration,
        start_time=session_data.start_time,
        end_time=session_data.end_time,
        corrected_char_count=input_data.corrected_char_count,
        deleted_char_count=input_data.deleted_char_count,
        total_char_count=input_data.total_char_count,
        error_char_count=input_data.error_char_count,
    )

    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)

    for key, uni in input_data.unigraphs.items():
        new_uni = Unigraph(
            user_stats_session_id=new_session.id,
            key=key,
            count=uni.count,
            accuracy=uni.accuracy,
        )
        db.add(new_uni)

    for key, di in input_data.digraphs.items():
        new_di = Digraph(
            user_stats_session_id=new_session.id,
            key=key,
            count=di.count,
            accuracy=di.accuracy,
            mean_interval=di.mean_interval,
        )
        db.add(new_di)

    return new_session


async def get_user_stats_session_by_id(
    session_id: UUID, db: AsyncSession = Depends(get_db)
) -> Optional[UserStatsSession]:
    return await db.get(UserStatsSession, session_id)


async def get_all_user_stats_sessions(
    db: AsyncSession = Depends(get_db)
) -> Sequence[UserStatsSession]:
    result = await db.execute(select(UserStatsSession))
    return result.scalars().all()


async def update_user_stats_session(
    update_data: UserStatsSessionUpdateInput, session_id: UUID, db: AsyncSession = Depends(get_db)
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
    session_id: UUID, db: AsyncSession = Depends(get_db)
) -> bool:
    session = await db.get(UserStatsSession, session_id)
    if not session:
        return False

    await db.delete(session)
    await db.commit()
    return True
