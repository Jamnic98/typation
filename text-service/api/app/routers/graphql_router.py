import strawberry
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from strawberry.fastapi import GraphQLRouter

from ..factories.database import async_sessionmaker
from ..graphql.resolvers.users_resolvers import UsersQuery, UsersMutation


def create_graphql_router(session_maker: async_sessionmaker[AsyncSession]):
    async def get_context(request: Request):
        # Create a new AsyncSession
        db = session_maker

        # Register cleanup
        async def close_db():
            await db.close()

        request.state.db_cleanup = close_db
        return {"db": db, "request": request}

    schema = strawberry.Schema(query=UsersQuery, mutation=UsersMutation)
    return GraphQLRouter(schema, context_getter=get_context)
