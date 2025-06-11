import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, init_db, get_db
from ..routers.graphql_router import create_graphql_router
from ..routers.text_router import text_router
from ..settings import settings


async def async_create_tables(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def create_app():
    engine, session_local = init_db(database_url=str(settings.DATABASE_URL), use_static_pool=True)

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        from sqlalchemy import create_engine
        sync_engine = create_engine(
            str(settings.DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")
        )
        Base.metadata.create_all(bind=sync_engine)
    else:
        asyncio.run(async_create_tables(engine))

    app = FastAPI()
    app.dependency_overrides[get_db] = get_db(session_local)  # type: ignore

    # GraphQL router with DB session injected
    graphql_app = create_graphql_router(session_local)
    app.include_router(graphql_app, prefix="/graphql")

    app.add_middleware(
        CORSMiddleware, # type: ignore
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.include_router(text_router)
    return app, session_local
