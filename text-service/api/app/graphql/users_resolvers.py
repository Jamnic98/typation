from typing import List, Optional

import strawberry
from strawberry.types import Info

from ..controllers.users_controller import get_all_users
from ..models.user_model import User
from ..schemas.user_schema import UserType


@strawberry.type
class Query:
    @strawberry.field()
    async def users(self, info: Info) -> List[UserType]:
        db = info.context["db"]
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
    async def user(self, info: Info, user_id: int) -> Optional[UserType]:
        db = info.context["db"]
        user = await db.get(User, user_id)
        return UserType(
            id=user.id,
            user_name=user.user_name,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
        ) if user else None
