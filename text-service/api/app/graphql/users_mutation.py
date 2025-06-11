import strawberry
from strawberry import Info

from ..controllers.users_controller import create_user, update_user, delete_user
from ..schemas.user_schema import UserCreate, UserType, UserUpdate


@strawberry.type
class Mutation:
    @strawberry.mutation()
    async def create_user(self, info: Info, email: str) -> UserType:
        db = info.context["db"]
        user_in = UserCreate(email=email)
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
        user_id: int,
        user_name: str
    ) -> UserType | None:
        db = info.context["db"]
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
    async def delete_user(self, info: Info, user_id: int) -> bool:
        db = info.context["db"]
        return await delete_user(db, user_id)
