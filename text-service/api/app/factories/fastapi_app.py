from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from random import shuffle


# class TextRequest(BaseModel):
#     prompt: str

def create_app() -> FastAPI:
    app = FastAPI()

    # noinspection PyTypeChecker
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
        input_text = 'the quick brown fox jumps over the lazy dog'
        words = input_text.split(' ')
        shuffle(words)
        output_text =  " ".join(words)
        return {"text": output_text}

    return app
