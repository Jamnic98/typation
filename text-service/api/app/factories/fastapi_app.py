from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..routers.text_router import text_router

def create_app() -> FastAPI:
    app = FastAPI()

    # noinspection PyTypeChecker
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['*'],
        allow_headers=['*']
    )

    @app.get('/health')
    def health():
        return {'status': 'ok'}

    app.include_router(text_router)

    return app
