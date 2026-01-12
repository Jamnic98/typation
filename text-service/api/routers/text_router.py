from functools import lru_cache
from pathlib import Path
from random import shuffle, sample
import string

from fastapi import APIRouter, Depends, Query  # Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import session, AsyncSession
from sqlalchemy.orm import selectinload

from api.auth.dependencies import get_current_user
from api.factories.database import get_db
from api.models.user_model import User
from api.models.user_stats_summary_model import UserStatsSummary
from api.settings import settings


text_router = APIRouter(prefix="/text")

# --------------------
# Canonical n-gram sets
# --------------------

ALL_UNIGRAPHS = list(string.ascii_lowercase)

ALL_DIGRAPHS = (
    [a + b for a in string.ascii_lowercase for b in string.ascii_lowercase]
    + [" " + c for c in string.ascii_lowercase]
    + [c + " " for c in string.ascii_lowercase]
)

DIFFICULTY_WEIGHT = 1.0


# --------------------
# Normalisation helpers
# --------------------

def normalise_unigraphs(user_unigraphs):
    stats = {u.key: u for u in user_unigraphs}

    merged = {}
    for char in ALL_UNIGRAPHS:
        if char in stats:
            accuracy = stats[char].accuracy / 100.0
            accuracy = min(max(accuracy, 0.0), 1.0)

            merged[char] = {
                "count": stats[char].count,
                "accuracy": accuracy,
                "seen": stats[char].count > 0,
            }
        else:
            merged[char] = {
                "count": 0,
                "accuracy": 0.0,
                "seen": False,
            }
    return merged



def normalise_digraphs(user_digraphs):
    stats = {d.key: d for d in user_digraphs}

    merged = {}
    for pair in ALL_DIGRAPHS:
        if pair in stats:
            accuracy = stats[pair].accuracy / 100.0
            accuracy = min(max(accuracy, 0.0), 1.0)

            merged[pair] = {
                "count": stats[pair].count,
                "accuracy": accuracy,
                "seen": stats[pair].count > 0,
            }
        else:
            merged[pair] = {
                "count": 0,
                "accuracy": 0.0,
                "seen": False,
            }
    return merged


# --------------------
# Scoring
# --------------------

def score_word(word, uni_stats, di_stats):
    score = 0.0
    word = word.lower()

    # unigraph contribution
    for c in word:
        stat = uni_stats.get(c)
        if not stat:
            continue

        difficulty = (1.0 - stat["accuracy"]) + (1.0 / (stat["count"] + 1))
        score += difficulty * DIFFICULTY_WEIGHT

    # digraph contribution (space padded)
    padded = f" {word} "
    for i in range(len(padded) - 1):
        pair = padded[i:i + 2]
        stat = di_stats.get(pair)
        if not stat:
            continue

        difficulty = (1.0 - stat["accuracy"]) + (1.0 / (stat["count"] + 1))
        score += difficulty * DIFFICULTY_WEIGHT

    ngram_count = max(len(word), 1) + (len(word) + 1)
    return score / ngram_count

# --------------------
# Endpoint
# --------------------

class TextParams(BaseModel):
    minlen: int | None = None
    maxlen: int | None = None



@text_router.post("/generate-practice-text")
async def generate_practice_text(
    params: TextParams,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    min_len = params.minlen or 1
    max_len = params.maxlen or 20
    if min_len > max_len:
        raise ValueError("min_len cannot be greater than max_len")

    word_list = load_word_list()

    # filter corpus early
    word_list = [
        w for w in word_list
        if min_len <= len(w) <= max_len
    ]

    if not word_list:
        return {"text": ""}

    stmt = (
        select(UserStatsSummary)
        .where(UserStatsSummary.user_id == current_user.id)
        .options(
            selectinload(UserStatsSummary.unigraphs),
            selectinload(UserStatsSummary.digraphs)
        )
    )

    result = await session.execute(stmt)
    summary = result.unique().scalars().one_or_none()

    # new user fallback
    if not summary:
        sample_words = sample(word_list, settings.WORD_LIMIT)
        shuffle(sample_words)  # <-- already shuffling, fine
        return {"text": " ".join(sample_words)}

    # existing user
    uni_stats = normalise_unigraphs(summary.unigraphs)
    di_stats = normalise_digraphs(summary.digraphs)

    scored_words = [
        (word, score_word(word, uni_stats, di_stats))
        for word in word_list
    ]

    scored_words.sort(key=lambda x: x[1], reverse=True)

    selected_words = [w for w, _ in scored_words[:settings.WORD_LIMIT]]

    # shuffle the selected words before sending
    shuffle(selected_words)

    return {"text": " ".join(selected_words)}


# --------------------
# Corpus loader
# --------------------

@lru_cache()
def load_word_list():
    root_path = Path(__file__).resolve().parent.parent.parent
    word_file = root_path / "text.txt"

    return [
        line.strip()
        for line in word_file.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
