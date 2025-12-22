import strawberry
from strawberry.fastapi import GraphQLRouter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from jose import JWTError

from ..graphql.resolvers.user_mutations import UsersMutation
from ..graphql.resolvers.user_queries import UsersQuery
from ..graphql.resolvers.unigraph_queries import UnigraphQuery
from ..models.user_model import User
from ..auth.dependencies import get_token_credentials
from ..factories.database import async_sessionmaker


def create_graphql_router(session_maker: async_sessionmaker[AsyncSession]):
    async def get_context(request: Request):
        user = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                user_id = get_token_credentials(token)
                # Open a temporary DB session just to fetch the user
                async with session_maker() as db:
                    result = await db.execute(select(User).where(User.id == user_id))
                    user = result.scalar_one_or_none()
            except JWTError:
                pass  # unauthenticated

        # Return context without an open DB session here
        return {
            "db_factory": session_maker,
            "request": request,
            "user": user,
        }

    @strawberry.type
    class Query(UsersQuery, UnigraphQuery):
        pass

    schema = strawberry.Schema(query=Query, mutation=UsersMutation)
    return GraphQLRouter(schema, context_getter=get_context)
