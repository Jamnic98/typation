from uuid import UUID
from typing import List, Optional
import strawberry
from strawberry.types import Info

from ...controllers.users_controller import create_user, update_user, delete_user, get_all_users
from ...models.user_model import User
from ...schemas.user_schema import UserCreate, UserType, UserUpdate, UserCreateInput


@strawberry.type
class UsersQuery:
    @strawberry.field()
    async def users(self, info: Info) -> List[UserType]:
        async_session_maker = info.context["db"]
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
    async def user(self, info: Info, user_id: UUID) -> Optional[UserType]:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            user = await db.get(User, user_id)
            return UserType(
                id=user.id,
                user_name=user.user_name,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            ) if user else None


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
