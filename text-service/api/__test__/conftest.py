import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from api.app.factories.database import Base, get_db
from api.app.factories.fastapi_app import create_app
from api.app.models.user_model import User

from api.app.settings import settings


# Create async engine (binds correctly to the event loop)
@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def async_session_maker():
    engine = create_async_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
    )
    async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

    # create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield async_session_maker

    # drop tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


# Actual session fixture — creates and tears down a session per test
@pytest_asyncio.fixture
async def async_session(async_session_maker):
    async with async_session_maker() as session:
        yield session


@pytest_asyncio.fixture
async def app(async_session_maker):
    app, _ = create_app()

    async def override_get_db():
        async with async_session_maker() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield app


@pytest_asyncio.fixture
async def async_client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def db(async_session_maker):
    async with async_session_maker() as session:
        async with session.begin():  # ensure transaction block
            yield session


@pytest_asyncio.fixture
async def seed_db(async_session_maker):  # Use session maker instead of the shared session
    async with async_session_maker() as session:
        users = [
            User(user_name="user1", first_name="User", last_name="One", email="user1@example.com"),
            User(user_name="user2", first_name="User", last_name="Two", email="user2@example.com"),
        ]
        session.add_all(users)
        await session.commit()

        for user in users:
            await session.refresh(user)

        return users


@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
