from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..routers.text_router import text_router
from ..routers.users_router import users_router
from .database import Base, init_db, get_db

def create_app(testing: bool = False):
    if testing:
        engine, session_local = init_db("sqlite:///:memory:", use_static_pool=True)
    else:
        engine, session_local = init_db("sqlite:///./prod.db")

    Base.metadata.create_all(bind=engine)

    app = FastAPI()

    # Use get_db from database.py directly, no override needed
    app.dependency_overrides[get_db] = get_db(session_local)

    app.include_router(users_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['*'],
        allow_headers=['*'],
    )

    @app.get('/health')
    def health():
        return {'status': 'ok'}

    app.include_router(text_router)
    return app, session_local
