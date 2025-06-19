from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncEngine

from .database import Base, init_db
from ..routers.graphql_router import create_graphql_router
from ..routers.text_router import text_router
from ..settings import settings


async def async_create_tables(engine: AsyncEngine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def get_lifespan(engine: AsyncEngine):
    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        await async_create_tables(engine)
        yield

    return lifespan


def create_app(engine=None, async_session=None):
    if engine is None or async_session is None:
        engine, async_session = init_db(database_url=str(settings.DATABASE_URL))

    app = FastAPI(lifespan=get_lifespan(engine))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(create_graphql_router(async_session), prefix="/graphql")
    app.include_router(text_router)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
