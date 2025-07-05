from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.digraph_model import Digraph
from ..models.unigraph_model import Unigraph
from ..models.user_stats_summary_model import UserStatsSummary
from ..graphql.types.user_stats_summary_type import UserStatsSummaryCreateInput, UserStatsSummaryUpdateInput, \
    UserStatsSummaryType


async def create_user_stats_summary(
    user_id: UUID,
    input_data: UserStatsSummaryCreateInput,
    db: AsyncSession
) -> UserStatsSummaryType:
    summary = UserStatsSummary(
        user_id=user_id,
        total_sessions=input_data.total_sessions,
        total_practice_duration=input_data.total_practice_duration,
        average_wpm=input_data.average_wpm,
        average_accuracy=input_data.average_accuracy,
        longest_consecutive_daily_practice_streak=input_data.longest_consecutive_daily_practice_streak,
        fastest_wpm=input_data.fastest_wpm,
        total_corrected_char_count=input_data.total_corrected_char_count,
        total_deleted_char_count=input_data.total_deleted_char_count,
        total_keystrokes=input_data.total_keystrokes,
        total_char_count=input_data.total_char_count,
        error_char_count=input_data.error_char_count,
    )

    db.add(summary)
    await db.flush()

    # Add unigraphs if provided
    if input_data.unigraphs:
        for uni in input_data.unigraphs:
            summary.unigraphs.append(
                Unigraph(
                    user_stats_summary_id=summary.id,
                    key=uni.key,
                    count=uni.count,
                    accuracy=uni.accuracy,
                )
            )

    # Add digraphs if provided
    if input_data.digraphs:
        for di in input_data.digraphs:
            summary.digraphs.append(
                Digraph(
                    user_stats_summary_id=summary.id,
                    key=di.key,
                    count=di.count,
                    accuracy=di.accuracy,
                    mean_interval=di.mean_interval
                )
            )

    await db.commit()
    await db.refresh(summary)

    return summary


async def get_user_stats_summary_by_user_id(
    user_id: UUID,
    db: AsyncSession
) -> Optional[UserStatsSummary]:
    result = await db.execute(
        select(UserStatsSummary).where(UserStatsSummary.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_user_stats_summary(
    user_id: UUID,
    update_data: UserStatsSummaryUpdateInput,
    db: AsyncSession
) -> Optional[UserStatsSummary]:
    result = await db.execute(
        select(UserStatsSummary)
        .options(
            selectinload(UserStatsSummary.unigraphs),
            selectinload(UserStatsSummary.digraphs)
        )
        .where(UserStatsSummary.user_id == user_id)
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
    # Refresh the summary to pick up any DB changes
    await db.refresh(summary)
    # Refresh relationships explicitly (optional)
    await db.refresh(summary, attribute_names=["unigraphs", "digraphs"])

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
