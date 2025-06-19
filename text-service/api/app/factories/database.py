from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def init_db(database_url: str):
    engine = create_async_engine(database_url, future=True)
    session_maker = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
    return engine, session_maker


def get_db(session_local_factory):
    async def _get_db():
        async with session_local_factory() as session:
            yield session
    return _get_db
