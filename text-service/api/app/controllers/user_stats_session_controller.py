from datetime import datetime
from uuid import UUID
from decimal import Decimal
from typing import Optional, Sequence, cast

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .user_stats_summary_controller import create_user_stats_summary, upsert_graphs
from ..factories.database import get_db
from ..graphql.types.user_stats_summary_type import UserStatsSummaryType
from ..models.unigraph_model import Unigraph
from ..models.user_stats_session_model import UserStatsSession
from ..graphql.types.user_stats_session_type import UserStatsSessionType
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

    result = await db.execute(
        select(UserStatsSummary)
        .options(selectinload(UserStatsSummary.unigraphs))
        .where(UserStatsSummary.user_id == user_id)
    )
    summary = result.scalars().first()

    # noinspection PyUnreachableCode
    if summary:
        await apply_session_to_summary(summary, input_data)
    else:
        summary = await create_user_stats_summary(user_id, None, db)
        await apply_session_to_summary(summary, input_data)

    await upsert_graphs(db, summary.id, input_data)

    await db.commit()
    return new_session


async def apply_session_to_summary(summary: UserStatsSummaryType, data: UserStatsSessionCreate) -> None:
    summary.total_sessions += 1
    summary.total_practice_duration += data.practice_duration or 0

    if summary.total_sessions == 1:
        summary.average_wpm = data.wpm or 0
        summary.average_accuracy = float(round(Decimal(str(data.accuracy or 0)), 1))
        summary.average_raw_accuracy = float(round(Decimal(str(data.raw_accuracy or 0)), 1))
    else:
        summary.average_wpm = round(
            ((summary.average_wpm * (summary.total_sessions - 1)) + (data.wpm or 0)) / summary.total_sessions
        )
        new_accuracy = (
            (Decimal(cast(float, summary.average_accuracy)) * (summary.total_sessions - 1)) +
            Decimal(str(data.accuracy or 0))
        ) / summary.total_sessions
        summary.average_accuracy = float(round(new_accuracy, 1))

        new_raw_accuracy = (
            (Decimal(cast(float, summary.average_raw_accuracy)) * (summary.total_sessions - 1)) +
            Decimal(str(data.accuracy or 0))
        ) / summary.total_sessions
        summary.average_raw_accuracy = float(round(new_raw_accuracy, 1))

    if data.wpm and data.wpm > (summary.fastest_wpm or 0):
        summary.fastest_wpm = data.wpm

    summary.total_corrected_char_count += data.corrected_char_count or 0
    summary.total_deleted_char_count += data.deleted_char_count or 0
    summary.total_keystrokes += data.total_keystrokes or 0
    summary.total_char_count += data.total_char_count or 0
    summary.error_char_count += data.error_char_count or 0

    # --- Update unigraphs ---
    if data.unigraphs:
        unigraph_dict = {u.key: u for u in summary.unigraphs}

        for char, stats in data.unigraphs.items():
            if char not in unigraph_dict:
                unigraph_dict[char] = Unigraph(key=char, count=0, accuracy=0, mistyped={})
                summary.unigraphs.append(unigraph_dict[char])

            new_count = getattr(stats, "count", 0)
            new_accuracy = getattr(stats, "accuracy", 0.0) # between 0–100
            new_mistyped = getattr(stats, "mistyped", {})

            unigraph = unigraph_dict[char]
            existing_count = unigraph.count
            existing_accuracy = unigraph.accuracy

            # Only compute weighted accuracy if new data exists
            if new_count > 0:
                updated_accuracy = (
                    (existing_accuracy * existing_count) + (new_accuracy * new_count)
                ) / (existing_count + new_count)

                unigraph.accuracy = int(round(updated_accuracy))

            # Update count AFTER accuracy is computed
            unigraph.count += new_count

            # noinspection PyUnreachableCode
            # Merge mistyped stats
            if not isinstance(unigraph.mistyped, dict):
                unigraph.mistyped = {}

            for mistyped_char, count in new_mistyped.items():
                unigraph.mistyped[mistyped_char] = unigraph.mistyped.get(mistyped_char, 0) + count


async def get_user_stats_session_by_id(
    session_id: UUID, db: AsyncSession
) -> Optional[UserStatsSession]:
    return await db.get(UserStatsSession, session_id)


async def get_user_stats_sessions_by_date_range(
    user_id: UUID,
    start_date: datetime,
    end_date: datetime,
    db: AsyncSession = Depends(get_db)
) -> Sequence[UserStatsSession]:
    result = await db.execute(
        select(UserStatsSession)
        .where(UserStatsSession.user_id == user_id)
        .where(UserStatsSession.start_time >= start_date)
        .where(UserStatsSession.end_time <= end_date)
        .order_by(UserStatsSession.start_time)
    )
    return result.scalars().all()


async def get_all_user_stats_sessions(
    db: AsyncSession = Depends(get_db)
) -> Sequence[UserStatsSession]:
    result = await db.execute(select(UserStatsSession))
    return result.scalars().all()


# async def update_user_stats_session(
#     update_data: UserStatsSessionUpdateInput, session_id: UUID, db: AsyncSession = Depends(get_db)
# ) -> type[UserStatsSession] | None:
#     session = await db.get(UserStatsSession, session_id)
#     if not session:
#         return None
#
#     update_fields = {
#         field: value for field, value in update_data.__dict__.items()
#         if value is not None
#     }
#     for field, value in update_fields.items():
#         setattr(session, field, value)
#
#     await db.commit()
#     await db.refresh(session)
#     return session
#
#
# async def delete_user_stats_session(
#     session_id: UUID, db: AsyncSession = Depends(get_db)
# ) -> bool:
#     session = await db.get(UserStatsSession, session_id)
#     if not session:
#         return False
#
#     await db.delete(session)
#     await db.commit()
#     return True
