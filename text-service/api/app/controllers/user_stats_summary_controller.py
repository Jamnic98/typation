from typing import Optional
from uuid import UUID

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models.digraph_model import Digraph
from ..models.unigraph_model import Unigraph
from ..models.user_stats_summary_model import UserStatsSummary
from ..graphql.types.user_stats_summary_type import UserStatsSummaryCreateInput, UserStatsSummaryUpdateInput, \
    UserStatsSummaryType
from ..schemas.user_stats_session_schema import UserStatsSessionCreate


async def create_user_stats_summary(
    user_id: UUID,
    input_data: UserStatsSummaryCreateInput | None,
    db: AsyncSession
) -> UserStatsSummaryType:
    # fallback to defaults if input_data is None
    if input_data is None:
        input_data = UserStatsSummaryCreateInput(
            total_sessions=0,
            total_practice_duration=0,
            average_wpm=0.0,
            average_accuracy=0.0,
            average_raw_accuracy=0.0,
            practice_streak=0,
            longest_streak=0,
            fastest_wpm=0,
            total_corrected_char_count=0,
            total_deleted_char_count=0,
            total_keystrokes=0,
            total_char_count=0,
            error_char_count=0,
        )

    summary = UserStatsSummary(
        user_id=user_id,
        total_sessions=input_data.total_sessions,
        total_practice_duration=input_data.total_practice_duration,
        average_wpm=input_data.average_wpm,
        average_accuracy=input_data.average_accuracy,
        average_raw_accuracy=input_data.average_raw_accuracy,
        practice_streak=input_data.practice_streak,
        longest_streak=input_data.longest_streak,
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
    # noinspection PyUnreachableCode
    if summary:
        # Update scalar fields
        update_fields = {
            field: value for field, value in update_data.__dict__.items()
            if value is not None and field not in ['unigraphs', 'digraphs']
        }
        for field, value in update_fields.items():
            setattr(summary, field, value)

        # === Update Unigraphs ===
        if update_data.unigraphs is not None:
            existing_uni_map = {u.key: u for u in summary.unigraphs}

            for uni in update_data.unigraphs:
                if uni.key in existing_uni_map:
                    # Update existing
                    existing = existing_uni_map[uni.key]
                    existing.count = uni.count
                    existing.accuracy = uni.accuracy
                else:
                    # Add new
                    summary.unigraphs.append(Unigraph(
                        user_stats_summary_id=summary.id,
                        key=uni.key,
                        count=uni.count,
                        accuracy=uni.accuracy
                    ))

        # === Update Digraphs ===
        if update_data.digraphs is not None:
            existing_di_map = {d.key: d for d in summary.digraphs}

            for di in update_data.digraphs:
                if di.key in existing_di_map:
                    existing = existing_di_map[di.key]
                    existing.count = di.count
                    existing.accuracy = di.accuracy
                    existing.mean_interval = di.mean_interval
                else:
                    summary.digraphs.append(Digraph(
                        user_stats_summary_id=summary.id,
                        key=di.key,
                        count=di.count,
                        accuracy=di.accuracy,
                        mean_interval=di.mean_interval
                    ))

        await db.commit()
        await db.refresh(summary)
        return summary

    return None


async def upsert_graphs(db: AsyncSession, summary_id: UUID, data: UserStatsSessionCreate):
    if data.unigraphs:
        for key, stat in data.unigraphs.items():
            stmt = insert(Unigraph).values(
                user_stats_summary_id=summary_id,
                key=key,
                count=stat.count,
                accuracy=stat.accuracy,
                mistyped=stat.mistyped
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
                mistyped=stat.mistyped or {}
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

# async def delete_user_stats_summary(
#     user_id: UUID,
#     db: AsyncSession
# ) -> bool:
#     result = await db.execute(
#         select(UserStatsSummary).where(UserStatsSummary.user_id == user_id)
#     )
#     summary = result.scalar_one_or_none()
#     # noinspection PyUnreachableCode
#     if summary:
#         await db.delete(summary)
#         await db.commit()
#         return True
#
#     return False
