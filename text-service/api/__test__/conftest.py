import pytest

from ..app.factories.database import Base, init_db, get_db
from ..app.factories.fastapi_app import create_app
from ..app.models.user_model import User
from ..app.settings import settings


@pytest.fixture(scope="session")
def test_db_engine_and_session():
    engine, testing_session_local = init_db(str(settings.database_url), use_static_pool=True)
    Base.metadata.create_all(bind=engine)
    yield engine, testing_session_local
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(test_db_engine_and_session):
    engine, testing_session_local = test_db_engine_and_session

    connection = engine.connect()
    transaction = connection.begin()
    session = testing_session_local(bind=connection)

    try:
        yield session
    finally:
        session.close()
        if transaction.is_active:
            transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def app(db):
    app, _ = create_app(testing=True)

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    yield app


@pytest.fixture(scope="function")
def client(app):
    from fastapi.testclient import TestClient

    with TestClient(app) as client:
        yield client


@pytest.fixture
def seed_db(db):
    users = [
        User(user_name="user1", first_name="User", last_name="One", email="user1@example.com"),
        User(user_name="user2", first_name="User", last_name="Two", email="user2@example.com"),
    ]
    for user in users:
        db.add(user)
    db.commit()
    for user in users:
        db.refresh(user)

    return users
