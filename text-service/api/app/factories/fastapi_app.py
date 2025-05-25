from random import shuffle
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


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
    async def generate_text():
        input_text = (
            f'the quick brown fox jumps over the lazy dog'
        )

        words = input_text.split(' ')
        shuffle(words)
        output_text =  " ".join(words)
        return {"text": output_text}
    
    return app


# from string import ascii_lowercase
#
# input_text = f'the quick brown fox jumps over the lazy dog'
# input_text_list = list(input_text)
#
# text_char_pairs = list(x+y for x, y in zip(input_text_list, input_text_list[1:]))
# print(text_char_pairs)
#
# chars = ' ' + ascii_lowercase
#
# char_pairs = []
# for char1 in chars:
#     for char2 in chars:
#         char_paris = char1 + char2
#         if char_pairs != '  ':
#             char_pairs.append(char_paris)
#
# char_pairs.remove('  ')
# print(char_pairs)
