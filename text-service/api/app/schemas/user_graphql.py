from typing import Optional
from uuid import UUID

import strawberry
from sqlalchemy import select
from strawberry import Info

from .user_stats_session_graphql import UserStatsSessionType
from .user_stats_summary_graphql import UserStatsSummaryType
from ..models.user_model import UserStatsSession


@strawberry.input
class UserCreateInput:
    user_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    password: str


@strawberry.type
class UserType:
    id: UUID
    user_name: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    email: str
    # sessions: Optional[list[UserStatsSessionType]] = None
    summary: Optional[UserStatsSummaryType] = None

    @strawberry.field()
    async def sessions(self, info: Info) -> list[UserStatsSessionType]:
        async_session = info.context["db_factory"]

        async with async_session() as db:  # <- Call it to get a session
            result = await db.execute(
                select(UserStatsSession).where(UserStatsSession.user_id == self.id)
            )
            sessions = result.scalars().all()

            return [
                UserStatsSessionType(
                    id=s.id,
                    user_id=s.user_id,
                    wpm=s.wpm,
                    accuracy=s.accuracy,
                    practice_duration=s.practice_duration,
                    created_at=s.created_at,
                    ended_at=s.ended_at,
                )
                for s in sessions
            ]
