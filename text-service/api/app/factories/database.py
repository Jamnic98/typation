from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


def init_db(database_url: str, use_static_pool: bool = False):
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {},
        poolclass=StaticPool if use_static_pool else None,
    )
    session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, session_local


def get_db(session_local):
    def _get_db():
        db = session_local()
        try:
            yield db
        finally:
            db.close()
    return _get_db
