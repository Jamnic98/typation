import strawberry
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from strawberry.fastapi import GraphQLRouter

from ..factories.database import async_sessionmaker
from ..graphql.resolvers.user_mutations import UsersMutation
from ..graphql.resolvers.user_queries import UsersQuery


def create_graphql_router(session_maker: async_sessionmaker[AsyncSession]):
    async def get_context(request: Request):
        # Just pass the factory; resolvers will open sessions as needed
        return {
            "db_factory": session_maker,
            "request": request
        }

    schema = strawberry.Schema(query=UsersQuery, mutation=UsersMutation)
    return GraphQLRouter(schema, context_getter=get_context)
