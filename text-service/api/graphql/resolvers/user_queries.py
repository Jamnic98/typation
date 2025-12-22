from uuid import UUID
from datetime import datetime
from typing import List, Optional

import strawberry
from strawberry.types import Info
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...controllers.users_controller import get_all_users
from ...controllers.user_stats_session_controller import get_all_user_stats_sessions, get_user_stats_session_by_id, \
    get_user_stats_sessions_by_date_range
from ...models.user_model import User
from ...models.user_stats_summary_model import UserStatsSummary
from ...schemas.user_graphql import UserType
from ...graphql.types.user_stats_summary_type import UserStatsSummaryType
from ..types.user_stats_session_type import UserStatsSessionType
from ..types.digraph_type import DigraphType
from ..types.unigraph_type import UnigraphType
from ...utils.helpers import to_timestamp


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
                    id=s.id,
                    user_id=s.user_id,
                    wpm=s.wpm,
                    net_wpm=s.net_wpm,
                    accuracy=s.accuracy,
                    practice_duration=s.practice_duration,
                    start_time=to_timestamp(s.start_time),
                    end_time=to_timestamp(s.end_time),
                    corrected_char_count=s.corrected_char_count,
                    deleted_char_count=s.deleted_char_count,
                    total_char_count=s.total_char_count,
                    total_keystrokes=s.total_keystrokes,
                    error_char_count=s.error_char_count
                )
                for s in sessions
            ]

    @strawberry.field()
    async def user_stats_session(
            self, info: Info, session_id: UUID
    ) -> Optional[UserStatsSessionType]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            session = await get_user_stats_session_by_id(session_id, db)

            # noinspection PyUnreachableCode
            if session:
                return UserStatsSessionType(
                    id=session.id,
                    user_id=session.user_id,
                    wpm=session.wpm,
                    net_wpm=session.net_wpm,
                    accuracy=session.accuracy,
                    raw_accuracy=session.raw_accuracy,
                    start_time=session.start_time.timestamp() if session.start_time else None,
                    end_time=session.end_time.timestamp() if session.end_time else None,
                    practice_duration=session.practice_duration,
                    corrected_char_count=session.corrected_char_count,
                    deleted_char_count=session.deleted_char_count,
                    total_char_count=session.total_char_count,
                    total_keystrokes=session.total_keystrokes,
                    error_char_count=session.error_char_count,
                )

    @strawberry.field()
    async def user_stats_sessions_by_date_range(
            self,
            info: Info,
            start_date: datetime,
            end_date: datetime,
    ) -> Optional[List[UserStatsSessionType]]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            user = info.context.get("user")
            if not user:
                # raise GraphQLError("User not authenticated")
                return None

            sessions = await get_user_stats_sessions_by_date_range(user.id, start_date, end_date, db)
            return [
                UserStatsSessionType(
                    id=s.id,
                    user_id=s.user_id,
                    wpm=s.wpm,
                    net_wpm=s.net_wpm,
                    accuracy=s.accuracy,
                    raw_accuracy=s.raw_accuracy,
                    practice_duration=s.practice_duration,
                    start_time=to_timestamp(s.start_time),
                    end_time=to_timestamp(s.end_time),
                    corrected_char_count=s.corrected_char_count,
                    deleted_char_count=s.deleted_char_count,
                    total_char_count=s.total_char_count,
                    total_keystrokes=s.total_keystrokes,
                    error_char_count=s.error_char_count,
                )
                for s in sessions
            ]

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

                average_accuracy=summary.average_accuracy,
                average_raw_accuracy=summary.average_raw_accuracy,

                fastest_wpm=summary.fastest_wpm,
                average_wpm=summary.average_wpm,

                average_net_wpm=summary.average_net_wpm,
                fastest_net_wpm=summary.fastest_net_wpm,

                total_practice_duration=summary.total_practice_duration,

                total_sessions=summary.total_sessions,
                practice_streak=summary.practice_streak,
                longest_streak=summary.longest_streak,

                total_corrected_char_count=summary.total_corrected_char_count,
                total_deleted_char_count=summary.total_deleted_char_count,
                total_keystrokes=summary.total_keystrokes,
                total_char_count=summary.total_char_count,
                error_char_count=summary.error_char_count,

                unigraphs=[
                    UnigraphType(
                        id=uni.id,
                        key=uni.key,
                        count=uni.count,
                        accuracy=uni.accuracy
                    )
                    for uni in summary.unigraphs
                ],

                digraphs=[
                    DigraphType(
                        id=di.id,
                        key=di.key,
                        mean_interval=di.mean_interval,
                        accuracy=di.accuracy,
                        count=di.count
                    )
                    for di in summary.digraphs
                ]
            )
