from uuid import UUID
from typing import List, Optional
import strawberry
from strawberry.types import Info

from ...controllers.user_stats_session_controller import get_all_user_stats_sessions, get_user_stats_session_by_id
from ...controllers.user_stats_summary_controller import get_user_stats_summary_by_user_id, get_all_user_stats_summaries
from ...controllers.users_controller import get_all_users
from ...models.user_model import User
from ...schemas.user_graphql import UserType
from ...schemas.user_stats_session_graphql import UserStatsSessionType
from ...schemas.user_stats_summary_graphql import UserStatsSummaryType


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

    @strawberry.field(name="userStatsSummaries")
    async def user_stats_summaries(self, info: Info) -> List[UserStatsSummaryType]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            summaries = await get_all_user_stats_summaries(db)
            return [
                UserStatsSummaryType(
                    user_id=summary.user_id,
                    total_sessions=summary.total_sessions,
                    total_practice_duration=summary.total_practice_duration,
                    average_wpm=summary.average_wpm,
                    average_accuracy=summary.average_accuracy,
                    best_wpm=summary.best_wpm,
                    best_accuracy=summary.best_accuracy,
                )
                for summary in summaries
            ]

    @strawberry.field(name="userStatsSummary")
    async def user_stats_summary(self, info: Info) -> Optional[UserStatsSummaryType]:
        user_id = info.context["user"].id
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            summary = await get_user_stats_summary_by_user_id(user_id, db)
            if not summary:
                return None
            return UserStatsSummaryType(
                user_id=summary.user_id,
                total_sessions=summary.total_sessions,
                total_practice_duration=summary.total_practice_duration,
                average_wpm=summary.average_wpm,
                average_accuracy=summary.average_accuracy,
                best_wpm=summary.best_wpm,
                best_accuracy=summary.best_accuracy,
            )
