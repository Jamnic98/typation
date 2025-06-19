import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from api.app.factories.database import Base, get_db
from api.app.factories.fastapi_app import create_app
from api.app.models.user_model import User
from api.app.settings import settings


@pytest_asyncio.fixture(scope="function")
async def app(async_engine, async_session_maker_fixture):
    app = create_app(engine=async_engine, async_session=async_session_maker_fixture)

    async def override_get_db():
        async with async_session_maker_fixture() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield app


@pytest_asyncio.fixture
async def async_client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture(scope="session")
async def async_engine():
    engine = create_async_engine(
        settings.DATABASE_URL,
        # echo=True,
        future=True,
        poolclass=NullPool,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_database(async_engine):
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest_asyncio.fixture(scope="session")
def async_session_maker_fixture(async_engine) -> async_sessionmaker:
    return async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

@pytest_asyncio.fixture
async def async_session(async_session_maker_fixture):
    async with async_session_maker_fixture() as session:
        yield session


async def create_test_users(async_session):
    users = [
        User(user_name="user1", first_name="User", last_name="One", email="user1@example.com"),
        User(user_name="user2", first_name="User", last_name="Two", email="user2@example.com"),
    ]
    async_session.add_all(users)
    await async_session.commit()
    for user in users:
        await async_session.refresh(user)
    return users


@pytest_asyncio.fixture
async def test_users(async_session):
    users = await create_test_users(async_session)
    return users
