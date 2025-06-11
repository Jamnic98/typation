from sqlalchemy.ext.asyncio import  create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool


Base = declarative_base()


def init_db(database_url: str, use_static_pool: bool = False):
    engine = create_async_engine(
        database_url,
        echo=False,
        connect_args={"check_same_thread": False} if "sqlite" in database_url else {},
        poolclass=StaticPool if use_static_pool else None,
        future=True,
    )

    testing_session_local = async_sessionmaker(engine, expire_on_commit=False)
    return engine, testing_session_local


def get_db(session_local_factory):
    async def _get_db():
        async with session_local_factory() as session:
            yield session
    return _get_db
