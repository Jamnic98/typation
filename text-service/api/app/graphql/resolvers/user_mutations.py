from uuid import UUID
from typing import Optional
import strawberry
from strawberry.types import Info

from ...controllers.users_controller import create_user, update_user, delete_user
from ...controllers.user_stats_controller import create_user_stats_session, update_user_stats_session
from ...schemas.user_graphql import UserType, UserCreateInput
from ...schemas.user_schema import UserCreate, UserUpdate
from ...schemas.user_stats_session_graphql import UserStatsSessionType, UserStatsSessionInput, \
    UserStatsSessionUpdateInput
from ...schemas.user_stats_session_schema import UserStatsSessionCreate


@strawberry.type
class UsersMutation:
    @strawberry.mutation()
    async def create_user(self, info: Info, user_input: UserCreateInput) -> UserType:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            # Convert Strawberry input to Pydantic model
            user_in = UserCreate(**user_input.__dict__)
            # Pass that to your DB creation logic
            user = await create_user(db, user_in)
            return UserType(
                id=user.id,
                user_name=user.user_name,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            )

    @strawberry.mutation()
    async def update_user(
        self,
        info: Info,
        user_id: UUID,
        user_name: str
    ) -> UserType | None:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            user_update = UserUpdate(user_name=user_name)
            user = await update_user(db, user_id, user_update)
            return UserType(
                id=user.id,
                user_name=user.user_name,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            ) if user else None

    @strawberry.mutation()
    async def delete_user(self, info: Info, user_id: UUID) -> bool:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            return await delete_user(db, user_id)

    @strawberry.mutation()
    async def create_user_stats_session(
        self, info: Info, user_stats_session_input: UserStatsSessionInput
    ) -> UserStatsSessionType:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            # convert to Pydantic model for DB logic
            session_data = UserStatsSessionCreate(**user_stats_session_input.__dict__)
            created = await create_user_stats_session(db, session_data)
            return UserStatsSessionType(
                id=created.id,
                user_id=created.user_id,
                wpm=created.wpm,
                accuracy=created.accuracy,
                practice_duration=created.practice_duration,
                created_at=created.created_at,
                ended_at=created.ended_at,
            )

    @strawberry.mutation()
    async def update_user_stats_session(
        self, info: Info, session_id: UUID, user_stats_session_input: UserStatsSessionUpdateInput
    ) -> Optional[UserStatsSessionType]:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            updated = await update_user_stats_session(db, session_id, user_stats_session_input)
            if not updated:
                return None
            return UserStatsSessionType(
                id=updated.id,
                user_id=updated.user_id,
                wpm=updated.wpm,
                accuracy=updated.accuracy,
                practice_duration=updated.practice_duration,
                created_at=updated.created_at,
                ended_at=updated.ended_at,
            )

    @strawberry.mutation()
    async def delete_user_stats_session(self, info: Info, session_id: UUID) -> bool:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            from ...controllers.user_stats_controller import delete_user_stats_session
            return await delete_user_stats_session(db, session_id)
