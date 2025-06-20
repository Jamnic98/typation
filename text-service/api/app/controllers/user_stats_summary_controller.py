from typing import Optional, Sequence
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..factories.database import get_db
from ..models.user_model import UserStatsSummary
from ..schemas.user_stats_summary_graphql import UserStatsSummaryCreateInput, UserStatsSummaryUpdateInput


async def create_user_stats_summary(
    summary_data: UserStatsSummaryCreateInput,
    db: AsyncSession = Depends(get_db)
) -> UserStatsSummary:
    new_summary = UserStatsSummary(
        user_id=summary_data.user_id,
        total_sessions=summary_data.total_sessions,
        total_practice_duration=summary_data.total_practice_duration,
        average_wpm=summary_data.average_wpm,
        average_accuracy=summary_data.average_accuracy,
        best_wpm=summary_data.best_wpm,
        best_accuracy=summary_data.best_accuracy,
    )
    db.add(new_summary)
    await db.commit()
    await db.refresh(new_summary)
    return new_summary


async def get_user_stats_summary_by_user_id(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Optional[UserStatsSummary]:
    return await db.get(UserStatsSummary, user_id)


async def get_all_user_stats_summaries(
    db: AsyncSession = Depends(get_db),
) -> Sequence[UserStatsSummary]:
    result = await db.execute(select(UserStatsSummary))
    return result.scalars().all()


async def update_user_stats_summary(
    update_data: UserStatsSummaryUpdateInput,
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> type[UserStatsSummary] | None:
    summary = await db.get(UserStatsSummary, user_id)
    if not summary:
        return None

    update_fields = {
        field: value for field, value in update_data.__dict__.items() if value is not None
    }
    for field, value in update_fields.items():
        setattr(summary, field, value)

    await db.commit()
    await db.refresh(summary)
    return summary


async def delete_user_stats_summary(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> bool:
    summary = await db.get(UserStatsSummary, user_id)
    if not summary:
        return False

    await db.delete(summary)
    await db.commit()
    return True
