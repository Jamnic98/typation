from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..routers.text_router import text_router
from ..routers.users_router import users_router
from .database import Base, init_db, get_db
from ..settings import Settings


def create_app(testing: bool = False):
    # Load settings from env and override testing param if needed
    settings = Settings()
    if testing:
        settings.testing = True

    if settings.testing:
        engine, session_local = init_db(database_url="sqlite:///:memory:", use_static_pool=True)
    else:
        engine, session_local = init_db(database_url=str(settings.database_url))

    Base.metadata.create_all(bind=engine)

    app = FastAPI()

    # Override get_db with session_local from init_db
    app.dependency_overrides[get_db] = get_db(session_local)

    app.include_router(users_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.include_router(text_router)
    return app, session_local
