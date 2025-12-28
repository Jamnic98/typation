# pylint: disable=redefined-outer-name

from datetime import timedelta
from typing import Callable, Optional, Any, Coroutine, AsyncGenerator, List
import uuid

import pytest_asyncio
from fastapi import FastAPI
from passlib.context import CryptContext
from httpx import AsyncClient, ASGITransport, Response
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
    AsyncEngine,
)
from sqlalchemy.ext.asyncio.session import async_sessionmaker as AsyncSessionMaker
from sqlalchemy.pool import NullPool

from api.auth.jwt import create_access_token
from api.factories.database import Base, get_db
from api.factories.fastapi_app import create_app
from api.models.user_model import User
from api.models.user_stats_session_model import UserStatsSession
from api.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================
# Core fixtures (real ones)
# ============================

@pytest_asyncio.fixture(scope="session")
async def async_engine_fixture() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(
        settings.DATABASE_URL,
        future=True,
        poolclass=NullPool,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def async_session_maker_fixture(
    async_engine_fixture: AsyncEngine,
) -> AsyncGenerator[AsyncSessionMaker[AsyncSession], None]:
    yield async_sessionmaker(
        bind=async_engine_fixture,
        expire_on_commit=False,
        class_=AsyncSession,
    )


@pytest_asyncio.fixture
async def async_session_fixture(
    async_session_maker_fixture: AsyncSessionMaker[AsyncSession],
) -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker_fixture() as session:
        yield session


# ============================
# Alias fixtures (lint-safe)
# ============================

@pytest_asyncio.fixture
async def engine(
    async_engine_fixture: AsyncEngine,
) -> AsyncGenerator[AsyncEngine, None]:
    yield async_engine_fixture


@pytest_asyncio.fixture
async def session_maker(
    async_session_maker_fixture: AsyncSessionMaker[AsyncSession],
) -> AsyncGenerator[AsyncSessionMaker[AsyncSession], None]:
    yield async_session_maker_fixture


@pytest_asyncio.fixture
async def session(
    async_session_fixture: AsyncSession,
) -> AsyncGenerator[AsyncSession, None]:
    yield async_session_fixture


# ============================
# Database setup
# ============================

@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_database(engine: AsyncEngine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ============================
# App and client
# ============================

@pytest_asyncio.fixture(scope="function")
async def app_fixture(
    engine: AsyncEngine,
    session_maker: AsyncSessionMaker[AsyncSession],
) -> AsyncGenerator[FastAPI, None]:
    app = create_app(
        engine=engine,
        async_sessionmaker=session_maker,
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_maker() as db_session:
            yield db_session

    app.dependency_overrides[get_db] = override_get_db
    yield app


@pytest_asyncio.fixture
async def async_client(
    app_fixture: FastAPI,
) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app_fixture)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as client:
        yield client


@pytest_asyncio.fixture
async def client(
    async_client: AsyncClient,
) -> AsyncGenerator[AsyncClient, None]:
    yield async_client


# ============================
# Test data
# ============================

@pytest_asyncio.fixture
async def test_users_fixture(
    session: AsyncSession,
) -> AsyncGenerator[list[User], None]:
    users = await create_test_users(session)
    yield users


@pytest_asyncio.fixture
async def users(
    test_users_fixture: list[User],
) -> AsyncGenerator[list[User], None]:
    yield test_users_fixture


@pytest_asyncio.fixture
async def test_user_stats_sessions(
    session: AsyncSession,
) -> AsyncGenerator[List[UserStatsSession], None]:
    users_list = await create_test_users(session)
    user_ids = [uuid.UUID(str(user.id)) for user in users_list]
    sessions = await create_test_user_stats_sessions(session, user_ids)
    yield sessions


# ============================
# Helpers
# ============================

@pytest_asyncio.fixture
def graphql_query_fixture(
    client: AsyncClient,
) -> Callable[[str, Optional[dict], Optional[dict]], Coroutine[Any, Any, Response]]:
    async def _graphql_query(
        query: str,
        variables: Optional[dict] = None,
        headers: Optional[dict] = None,
    ) -> Response:
        payload = {"query": query}
        if variables:
            payload["variables"] = variables

        return await client.post(
            settings.GRAPHQL_ENDPOINT,
            json=payload,
            headers=headers or {},
        )

    return _graphql_query


@pytest_asyncio.fixture
async def auth_token(
    users: list[User],
) -> str:
    user = users[0]
    return create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(hours=1),
    )


# ============================
# Data creators
# ============================

async def create_test_users(
    session: AsyncSession,
) -> list[User]:
    password = "testpassword123"
    hashed_password = pwd_context.hash(password)

    users = [
        User(
            user_name="user1",
            first_name="User",
            last_name="One",
            email=f"user-{uuid.uuid4()}@example.com",
            hashed_password=hashed_password,
        ),
        User(
            user_name="user2",
            first_name="User",
            last_name="Two",
            email=f"user-{uuid.uuid4()}@example.com",
            hashed_password=hashed_password,
        ),
    ]

    session.add_all(users)
    await session.commit()

    for user in users:
        await session.refresh(user)

    return users


async def create_test_user_stats_sessions(
    session: AsyncSession,
    user_ids: List[uuid.UUID],
) -> List[UserStatsSession]:
    sessions = [
        UserStatsSession(
            user_id=user_ids[0],
            wpm=60,
            accuracy=0.999,
            practice_duration=60000,
        ),
        UserStatsSession(
            user_id=user_ids[1],
            wpm=75,
            accuracy=0.911,
            practice_duration=90000,
        ),
    ]

    session.add_all(sessions)
    await session.commit()

    for stats_session in sessions:
        await session.refresh(stats_session)

    return sessions
