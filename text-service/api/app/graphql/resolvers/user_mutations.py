from uuid import UUID
from typing import Optional
import strawberry
from passlib.context import CryptContext
from strawberry.types import Info

from ...controllers.user_stats_summary_controller import update_user_stats_summary, delete_user_stats_summary, \
    get_user_stats_summary_by_user_id, create_user_stats_summary
from ...controllers.users_controller import create_user, update_user, delete_user
from ...controllers.user_stats_controller import create_user_stats_session, update_user_stats_session
from ...schemas.user_graphql import UserType, UserCreateInput
from ...schemas.user_schema import UserCreate, UserUpdate
from ...schemas.user_stats_session_graphql import UserStatsSessionType, UserStatsSessionInput, \
    UserStatsSessionUpdateInput
from ...schemas.user_stats_session_schema import UserStatsSessionCreate
from ...schemas.user_stats_summary_graphql import UserStatsSummaryType, UserStatsSummaryUpdateInput, \
    UserStatsSummaryCreateInput

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@strawberry.type
class UsersMutation:
    @strawberry.mutation()
    async def create_user(self, info: Info, user_input: UserCreateInput) -> UserType:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            # Hash the incoming plaintext password
            hashed_password = pwd_context.hash(user_input.password)

            # Convert Strawberry input to dict, add hashed password
            user_data = user_input.__dict__.copy()
            user_data["hashed_password"] = hashed_password
            del user_data["password"]  # Remove plaintext password

            # Create your Pydantic model or ORM-compatible object
            user_in = UserCreate(**user_data)  # <- this should match your expected DB input

            # Save to database
            user = await create_user(user_in, db)

            # Return GraphQL-safe user object (no hashed password)
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
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            user_update = UserUpdate(user_name=user_name)
            user = await update_user(user_update, user_id, db)
            return UserType(
                id=user.id,
                user_name=user.user_name,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            ) if user else None

    @strawberry.mutation()
    async def delete_user(self, info: Info, user_id: UUID) -> bool:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            return await delete_user(user_id, db)

    @strawberry.mutation()
    async def create_user_stats_session(
        self, info: Info, user_stats_session_input: UserStatsSessionInput
    ) -> UserStatsSessionType:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            # convert to Pydantic model for DB logic
            session_data = UserStatsSessionCreate(**user_stats_session_input.__dict__)
            created = await create_user_stats_session(session_data, db)
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
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            updated = await update_user_stats_session(user_stats_session_input, session_id, db)
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
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            from ...controllers.user_stats_controller import delete_user_stats_session
            return await delete_user_stats_session(session_id, db)


    @strawberry.mutation()
    async def create_user_stats_summary(
        self, info: Info, user_stats_summary_input: UserStatsSummaryCreateInput
    ) -> UserStatsSummaryType:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            created = await create_user_stats_summary(user_stats_summary_input, db)
            return UserStatsSummaryType(
                user_id=created.user_id,
                total_sessions=created.total_sessions,
                total_practice_duration=created.total_practice_duration,
                average_wpm=created.average_wpm,
                average_accuracy=created.average_accuracy,
                best_wpm=created.best_wpm,
                best_accuracy=created.best_accuracy,
            )

    @strawberry.mutation()
    async def update_user_stats_summary(
        self, info: Info, user_id: UUID, user_stats_summary_input: UserStatsSummaryUpdateInput
    ) -> Optional[UserStatsSummaryType]:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            updated = await update_user_stats_summary(user_stats_summary_input, user_id, db)
            if not updated:
                return None
            return UserStatsSummaryType(
                user_id=updated.user_id,
                total_sessions=updated.total_sessions,
                total_practice_duration=updated.total_practice_duration,
                average_wpm=updated.average_wpm,
                average_accuracy=updated.average_accuracy,
                best_wpm=updated.best_wpm,
                best_accuracy=updated.best_accuracy,
            )

    @strawberry.mutation()
    async def delete_user_stats_summary(self, info: Info, user_id: UUID) -> bool:
        async_session_maker = info.context["db_factory"]
        async with async_session_maker() as db:
            return await delete_user_stats_summary(user_id, db)

    @strawberry.field()
    async def user_stats_summary(self, info: Info, user_id: UUID) -> Optional[UserStatsSummaryType]:
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
