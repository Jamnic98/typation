from fastapi import FastAPI


def create_app() -> FastAPI:
    app = FastAPI()

    @app.post('/generate-text')
    def generate_text():  # request: Request):
        # request_data = request.json()
        text = 'The quick brown fox jumps over the lazy dog.'
        return {'text': text}

    return app
