from typing import Callable, Optional, Any, Coroutine, AsyncGenerator, List
from uuid import UUID

import pytest_asyncio
from httpx import AsyncClient, ASGITransport, Response
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from sqlalchemy.ext.asyncio.session import async_sessionmaker as AsyncSessionMaker

from api.app.factories.database import Base, get_db
from api.app.factories.fastapi_app import create_app
from api.app.models.user_model import User, UserStatsSession
from api.app.settings import settings

GRAPHQL_ENDPOINT = "/graphql"



@pytest_asyncio.fixture(scope="function")
async def app(
    async_engine: AsyncEngine,
    async_session_maker_fixture: AsyncSessionMaker[AsyncSession]
) -> AsyncGenerator:
    app = create_app(engine=async_engine, async_session=async_session_maker_fixture)

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with async_session_maker_fixture() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield app


@pytest_asyncio.fixture
async def async_client(app: Any) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture(scope="session")
async def async_engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(
        settings.DATABASE_URL,
        future=True,
        poolclass=NullPool,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_database(async_engine: AsyncEngine) -> AsyncGenerator[None, None]:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest_asyncio.fixture(scope="session")
def async_session_maker_fixture(async_engine: AsyncEngine) -> AsyncSessionMaker[AsyncSession]:
    return async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


@pytest_asyncio.fixture
async def async_session(
    async_session_maker_fixture: AsyncSessionMaker[AsyncSession]
) -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker_fixture() as session:
        yield session


@pytest_asyncio.fixture
async def test_users(async_session: AsyncSession) -> list[User]:
    return await create_test_users(async_session)


@pytest_asyncio.fixture
async def test_user_stats_sessions(async_session: AsyncSession) -> List[UserStatsSession]:
    test_users = await create_test_users(async_session)
    user_ids = [user.id for user in test_users]
    user_stats_sessions = await create_test_user_stats_sessions(async_session, user_ids)
    return user_stats_sessions


@pytest_asyncio.fixture(scope="session", autouse=True)
async def final_database_cleanup(async_engine: AsyncEngine) -> AsyncGenerator[None, None]:
    yield  # Wait until all tests complete
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
def graphql_query_fixture(async_client: AsyncClient) -> Callable[
    [str, dict | str | None], Coroutine[Any, Any, Response]]:
    async def _graphql_query(query: str, variables: Optional[dict | str] = None) -> Response:
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        response = await async_client.post(GRAPHQL_ENDPOINT, json=payload)
        return response

    return _graphql_query


# TODO: refactor
# DB seed fixtures
async def create_test_users(async_session: AsyncSession) -> list[User]:
    users = [
        User(user_name="user1", first_name="User", last_name="One", email="user1@example.com"),
        User(user_name="user2", first_name="User", last_name="Two", email="user2@example.com"),
    ]
    async_session.add_all(users)
    await async_session.commit()
    for user in users:
        await async_session.refresh(user)
    return users


async def create_test_user_stats_sessions(
    async_session: AsyncSession, user_ids: List[UUID]
) -> List[UserStatsSession]:
    sessions = [
        UserStatsSession(
            user_id=user_ids[0],
            wpm=60,
            accuracy=90,
            practice_duration=60000,
        ),
        UserStatsSession(
            user_id=user_ids[1],
            wpm=75,
            accuracy=95,
            practice_duration=90000,
        ),
    ]
    async_session.add_all(sessions)
    await async_session.commit()
    for session in sessions:
        await async_session.refresh(session)
    return sessions
