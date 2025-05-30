import pytest
from fastapi.testclient import TestClient

from ..app.factories.database import Base, init_db, get_db
from ..app.factories.fastapi_app import create_app
from ..app.models.user_model import User

# Initialise the test DB engine and session globally once for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine, TestingSessionLocal = None, None

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    global engine, TestingSessionLocal
    engine, TestingSessionLocal = init_db(TEST_DATABASE_URL, use_static_pool=True)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    """Provide a clean database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        if transaction.is_active:
            transaction.rollback()

        connection.close()


@pytest.fixture(scope="function")
def app(db):
    """Create a FastAPI app instance with dependency override for DB session."""
    app, _ = create_app(testing=True)

    def override_get_db():
        try:
            yield db
        finally:
            pass

    # Override the FastAPI dependency to use the test DB session
    app.dependency_overrides[get_db(TestingSessionLocal)] = override_get_db
    return app


@pytest.fixture
def client(db):
    from fastapi.testclient import TestClient
    from ..app.factories.fastapi_app import create_app

    test_app = create_app(testing=True)[0]

    def override_get_db():
        yield db

    test_app.dependency_overrides[get_db] = override_get_db
    with TestClient(test_app) as client:
        yield client


@pytest.fixture
def seed_db(db):  # use the fixture that yields your test DB session
    users = [
        User(user_name="user1", first_name="User", last_name="One", email="user1@example.com"),
        User(user_name="user2", first_name="User", last_name="Two", email="user2@example.com"),
    ]
    for user in users:
        db.add(user)
    db.commit()

    # Refresh to get IDs
    for user in users:
        db.refresh(user)

    return users
