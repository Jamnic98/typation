from uuid import UUID
from typing import List, Optional
import strawberry
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from strawberry.types import Info

from ...controllers.user_stats_session_controller import get_all_user_stats_sessions, get_user_stats_session_by_id
from ...controllers.users_controller import get_all_users
from ...models.digraph_model import Digraph
from ...models.unigraph_model import Unigraph
from ...models.user_model import User
from ...models.user_stats_summary_model import UserStatsSummary
from ...schemas.user_graphql import UserType
from ..types.user_stats_session_type import UserStatsSessionType
from ...graphql.types.user_stats_summary_type import UserStatsSummaryType


@strawberry.type
class UsersQuery:
    @strawberry.field()
    async def users(self, info: Info) -> List[UserType]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            users = await get_all_users(db)
            return [
                UserType(
                    id=user.id,
                    user_name=user.user_name,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email
                )
                for user in users
            ]

    @strawberry.field()
    async def user(self, info: Info) -> Optional[UserType]:
        user = info.context["user"]
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            user = await db.get(User, user.id)
            return UserType(
                id=user.id,
                user_name=user.user_name,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            ) if user else None

    @strawberry.field(name="userStatsSessions")
    async def user_stats_sessions(self, info: Info) -> list[UserStatsSessionType]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            sessions = await get_all_user_stats_sessions(db)
            return [
                UserStatsSessionType(
                    id=session.id,
                    user_id=session.user_id,
                    wpm=session.wpm,
                    accuracy=session.accuracy,
                    practice_duration=session.practice_duration,
                    start_time=session.start_time,
                    end_time=session.end_time,
                )
                for session in sessions
            ]

    @strawberry.field()
    async def user_stats_session(self, info: Info, session_id: UUID) -> Optional[UserStatsSessionType]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            session = await get_user_stats_session_by_id(session_id, db)
            if not session:
                return None
            return UserStatsSessionType(
                id=session.id,
                user_id=session.user_id,
                wpm=session.wpm,
                accuracy=session.accuracy,
                practice_duration=session.practice_duration,
                start_time=session.start_time,
                end_time=session.end_time

            )

    @strawberry.field(name="userStatsSummary")
    async def user_stats_summary(self, info: Info) -> Optional[UserStatsSummaryType]:
        user_id = info.context["user"].id
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            result = await db.execute(
                select(UserStatsSummary)
                .options(
                    selectinload(UserStatsSummary.unigraphs),
                    selectinload(UserStatsSummary.digraphs),
                )
                .filter(UserStatsSummary.user_id == user_id)
            )
            summary = result.scalar_one_or_none()
            if not summary:
                return None

            return UserStatsSummaryType(
                user_id=summary.user_id,
                total_sessions=summary.total_sessions,
                total_practice_duration=summary.total_practice_duration,
                average_wpm=summary.average_wpm,
                average_accuracy=summary.average_accuracy,
                longest_consecutive_daily_practice_streak=summary.longest_consecutive_daily_practice_streak,
                fastest_wpm=summary.fastest_wpm,
                total_corrected_char_count=summary.total_corrected_char_count,
                total_deleted_char_count=summary.total_deleted_char_count,
                total_keystrokes=summary.total_keystrokes,
                total_char_count=summary.total_char_count,
                error_char_count=summary.error_char_count,
                unigraphs=[
                    Unigraph(key=uni.key, accuracy=uni.accuracy, count=uni.count)
                    for uni in summary.unigraphs
                ],
                digraphs=[
                    Digraph(key=di.key, mean_interval=di.mean_interval, accuracy=di.accuracy, count=di.count)
                    for di in summary.digraphs
                ]
            )
