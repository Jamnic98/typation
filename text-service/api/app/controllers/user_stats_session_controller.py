from uuid import UUID
from decimal import Decimal
from typing import  Optional,Sequence

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from ..factories.database import get_db
from ..models.digraph_model import Digraph
from ..models.unigraph_model import Unigraph
from ..models.user_stats_session_model import UserStatsSession
from ..graphql.types.user_stats_session_type import UserStatsSessionUpdateInput, UserStatsSessionType
from ..models.user_stats_summary_model import UserStatsSummary
from ..schemas.user_stats_session_schema import UserStatsSessionCreate


async def create_user_stats_session(
    user_id: UUID,
    input_data: UserStatsSessionCreate,
    db: AsyncSession = Depends(get_db)
) -> UserStatsSessionType:
    new_session = UserStatsSession(user_id=user_id, **input_data.model_dump(exclude={"unigraphs", "digraphs"}))
    db.add(new_session)
    await db.flush()
    await db.refresh(new_session)

    result = await db.execute(select(UserStatsSummary).where(UserStatsSummary.user_id == user_id))
    summary = result.scalars().first()

    if summary:
        update_user_stats_summary(summary, input_data)
        await upsert_graphs(db, summary.id, input_data)
    else:
        await create_user_stats_summary(db, user_id, input_data)

    await db.commit()
    return new_session


async def create_user_stats_summary(db: AsyncSession, user_id: UUID, data: UserStatsSessionCreate) -> UserStatsSummary:
    summary = UserStatsSummary(
        user_id=user_id,
        total_sessions=1,
        total_practice_duration=data.practice_duration,
        average_wpm=data.wpm,
        average_accuracy=data.accuracy,
        longest_consecutive_daily_practice_streak=0,
        fastest_wpm=data.wpm,
        total_corrected_char_count=data.corrected_char_count,
        total_deleted_char_count=data.deleted_char_count,
        total_keystrokes=data.total_char_count,
        total_char_count=data.total_char_count,
        error_char_count=data.error_char_count,
    )
    db.add(summary)
    await db.flush()
    await insert_graphs(db, summary.id, data)
    return summary


def update_user_stats_summary(summary: UserStatsSummary, data: UserStatsSessionCreate) -> None:
    summary.total_sessions += 1
    summary.total_practice_duration += data.practice_duration or 0

    if summary.total_sessions > 1:
        summary.average_wpm = round(
            ((summary.average_wpm * (summary.total_sessions - 1)) + (data.wpm or 0)) / summary.total_sessions
        )

        new_accuracy = (
            (Decimal(summary.average_accuracy) * (summary.total_sessions - 1)) +
            (Decimal(str(data.accuracy)) if data.accuracy is not None else Decimal("0"))
        ) / summary.total_sessions

        summary.average_accuracy = float(round(new_accuracy, 2))  # Convert to float here

    else:
        summary.average_wpm = data.wpm or 0
        summary.average_accuracy = float(round(Decimal(str(data.accuracy)) if
                                               data.accuracy is not None else Decimal("0"), 2))

    if data.wpm and data.wpm > (summary.fastest_wpm or 0):
        summary.fastest_wpm = data.wpm

    summary.total_corrected_char_count += data.corrected_char_count or 0
    summary.total_deleted_char_count += data.deleted_char_count or 0
    summary.total_keystrokes += data.total_char_count or 0
    summary.total_char_count += data.total_char_count or 0
    summary.error_char_count += data.error_char_count or 0


async def upsert_graphs(db: AsyncSession, summary_id: UUID, data: UserStatsSessionCreate):
    if data.unigraphs:
        for key, stat in data.unigraphs.items():
            stmt = insert(Unigraph).values(
                user_stats_summary_id=summary_id,
                key=key,
                count=stat.count,
                accuracy=stat.accuracy,
            ).on_conflict_do_update(
                index_elements=['user_stats_summary_id', 'key'],
                set_={
                    'count': stat.count,
                    'accuracy': stat.accuracy,
                }
            )
            await db.execute(stmt)

    if data.digraphs:
        for key, stat in data.digraphs.items():
            stmt = insert(Digraph).values(
                user_stats_summary_id=summary_id,
                key=key,
                count=stat.count,
                accuracy=stat.accuracy,
                mean_interval=stat.mean_interval,
            ).on_conflict_do_update(
                index_elements=['user_stats_summary_id', 'key'],
                set_={
                    'count': stat.count,
                    'accuracy': stat.accuracy,
                    'mean_interval': stat.mean_interval,
                }
            )
            await db.execute(stmt)


async def insert_graphs(db: AsyncSession, summary_id: UUID, data: UserStatsSessionCreate):
    if data.unigraphs:
        for key, stat in data.unigraphs.items():
            db.add(Unigraph(
                user_stats_summary_id=summary_id,
                key=key,
                count=stat.count,
                accuracy=stat.accuracy,
            ))
    if data.digraphs:
        for key, stat in data.digraphs.items():
            db.add(Digraph(
                user_stats_summary_id=summary_id,
                key=key,
                count=stat.count,
                accuracy=stat.accuracy,
                mean_interval=stat.mean_interval,
            ))

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
