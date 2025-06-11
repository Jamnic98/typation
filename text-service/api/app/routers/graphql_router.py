import strawberry
from starlette.requests import Request
from strawberry.fastapi import GraphQLRouter

from ..factories.database import get_db
from ..graphql.users_mutation import Mutation
from ..graphql.users_resolvers import Query


def create_graphql_router(session_factory):
    _get_db = get_db(session_factory)

    async def get_context(request: Request):
        db_gen = _get_db()
        db = await anext(db_gen)

        async def close_db():
            await db_gen.aclose()

        request.state.db_cleanup = close_db
        return {"db": db, "request": request}

    schema = strawberry.Schema(query=Query, mutation=Mutation)
    return GraphQLRouter(schema, context_getter=get_context)
