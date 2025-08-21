import asyncio
import uuid
from datetime import timedelta
from uuid import UUID
from typing import Callable, Optional, Any, Coroutine, AsyncGenerator, List
from passlib.context import CryptContext

import pytest_asyncio
from httpx import AsyncClient, ASGITransport, Response
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from sqlalchemy.ext.asyncio.session import async_sessionmaker as AsyncSessionMaker

from ..app.auth.jwt import create_access_token
from ..app.factories.database import Base, get_db
from ..app.factories.fastapi_app import create_app
from ..app.models.user_model import User
from ..app.models.user_stats_session_model import UserStatsSession
from ..app.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest_asyncio.fixture(scope="function")
async def app(
    async_engine: AsyncEngine,
    async_session_maker_fixture: AsyncSessionMaker[AsyncSession]
) -> AsyncGenerator:
    app = create_app(engine=async_engine, async_sessionmaker=async_session_maker_fixture)

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


@pytest_asyncio.fixture(scope="function")
async def async_session(async_session_maker_fixture: AsyncSessionMaker[AsyncSession]) -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker_fixture() as session:
        yield session
    # session is closed automatically here

@pytest_asyncio.fixture(scope="session")
async def async_engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(settings.DATABASE_URL, future=True)  #, echo=True)
    yield engine
    await engine.dispose()  # Dispose explicitly when session ends


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_database(async_engine: AsyncEngine):
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield  # tests run here

    # teardown after yield, properly awaited
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
def async_session_maker_fixture(async_engine):
    return async_sessionmaker(
        bind=async_engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )


@pytest_asyncio.fixture
async def async_session(
    async_session_maker_fixture: AsyncSessionMaker[AsyncSession]
) -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker_fixture() as session:
        yield session


@pytest_asyncio.fixture
async def test_users(async_session: AsyncSession) -> AsyncGenerator[list[User], Any]:
    users = await create_test_users(async_session)
    yield users


@pytest_asyncio.fixture
async def test_user_stats_sessions(async_session: AsyncSession) -> AsyncGenerator[List[UserStatsSession], None]:
    test_users = await create_test_users(async_session)
    user_ids = [user.id for user in test_users]
    sessions = await create_test_user_stats_sessions(async_session, user_ids)
    yield sessions


@pytest_asyncio.fixture(scope="function", autouse=True)
async def final_database_cleanup(async_engine: AsyncEngine):
    yield
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await async_engine.dispose()


@pytest_asyncio.fixture
def graphql_query_fixture(async_client: AsyncClient) -> Callable[
    [str, Optional[dict], Optional[dict]], Coroutine[Any, Any, Response]]:
    async def _graphql_query(
            query: str,
            variables: Optional[dict] = None,
            headers: Optional[dict] = None
    ) -> Response:
        payload = {"query": query}
        if variables:
            payload["variables"] = variables

        response = await async_client.post(
            settings.GRAPHQL_ENDPOINT,
            json=payload,
            headers=headers or {}
        )
        return response

    return _graphql_query


@pytest_asyncio.fixture
async def auth_token(test_users: list[User]) -> str:
    test_user = test_users[0]
    return create_access_token({"sub": str(test_user.id)}, expires_delta=timedelta(hours=1))


# TODO: move
async def create_test_users(async_session: AsyncSession) -> list[User]:
    password = "testpassword123"
    hashed_password = pwd_context.hash(password)
    test_users = [
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
    async_session.add_all(test_users)
    await async_session.commit()
    for user in test_users:
        await async_session.refresh(user)
    return test_users


# TODO: move
async def create_test_user_stats_sessions(
    async_session: AsyncSession, user_ids: List[UUID]
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
    async_session.add_all(sessions)
    await async_session.commit()
    for session in sessions:
        await async_session.refresh(session)
    return sessions
