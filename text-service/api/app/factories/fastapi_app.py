from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# class TextRequest(BaseModel):
#     prompt: str

def create_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/generate-text")
    async def generate_text():  # body: TextRequest):
        text = 'The quick brown fox jumps over the lazy dog.'
        return {"text": text}

    return app
