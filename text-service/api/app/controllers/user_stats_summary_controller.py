from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.user_model import UserStatsSummary
from ..schemas.user_stats_summary_graphql import UserStatsSummaryCreateInput, UserStatsSummaryUpdateInput


async def create_user_stats_summary(
    user_id: UUID,
    summary_data: UserStatsSummaryCreateInput,
    db: AsyncSession
) -> UserStatsSummary:
    new_summary = UserStatsSummary(
        user_id=user_id,
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
    db: AsyncSession
) -> Optional[UserStatsSummary]:
    result = await db.execute(
        select(UserStatsSummary).where(UserStatsSummary.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_all_user_stats_summaries(
    db: AsyncSession
) -> Sequence[UserStatsSummary]:
    result = await db.execute(select(UserStatsSummary))
    return result.scalars().all()


async def update_user_stats_summary(
    user_id: UUID,
    update_data: UserStatsSummaryUpdateInput,
    db: AsyncSession
) -> Optional[UserStatsSummary]:
    result = await db.execute(
        select(UserStatsSummary).where(UserStatsSummary.user_id == user_id)
    )
    summary = result.scalar_one_or_none()
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
    db: AsyncSession
) -> bool:
    result = await db.execute(
        select(UserStatsSummary).where(UserStatsSummary.user_id == user_id)
    )
    summary = result.scalar_one_or_none()
    if not summary:
        return False

    await db.delete(summary)
    await db.commit()
    return True
