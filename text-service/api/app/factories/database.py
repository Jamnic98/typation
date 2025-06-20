from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from ..settings import settings

Base = declarative_base()

db_engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)

async_sessionmaker_instance = async_sessionmaker(
    bind=db_engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

async def get_db():
    async with async_sessionmaker_instance() as session:
        yield session
