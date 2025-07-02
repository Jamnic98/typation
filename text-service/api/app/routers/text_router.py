from functools import lru_cache
from pathlib import Path
from random import shuffle, sample

from fastapi import APIRouter

text_router = APIRouter(prefix='/text')


@text_router.post('/generate-practice-text')
async def generate_practice_text():
    word_list = sample(load_word_list(), 5)
    shuffle(word_list)
    return {'text': ' '.join(word_list)}


@lru_cache()
def load_word_list():
    root_path = Path(__file__).resolve().parent.parent.parent
    word_file = root_path / 'text.txt'
    return [line.strip() for line in word_file.read_text(encoding='utf-8').splitlines() if line.strip()]
