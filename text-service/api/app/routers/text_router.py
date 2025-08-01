from functools import lru_cache
from pathlib import Path
from random import shuffle, sample

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..auth.dependencies import get_current_user
from ..factories.database import get_db
from ..models.user_model import User
from ..models.user_stats_summary_model import UserStatsSummary
from ..utils.helpers import get_unigraph_weights, get_digraph_weights, score_word
from ..settings import settings


text_router = APIRouter(prefix="/text")


@text_router.post("/generate-practice-text")
async def generate_practice_text(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    word_list = load_word_list()
    stmt = (
        select(UserStatsSummary)
        .where(UserStatsSummary.user_id == current_user.id)
        .options(
            selectinload(UserStatsSummary.unigraphs),
            selectinload(UserStatsSummary.digraphs)
        )
    )
    result = await session.execute(stmt)
    summary = result.scalar_one_or_none()

    if not summary:
        sample_words = sample(word_list, settings.WORD_LIMIT)
        shuffle(sample_words)
        return {"text": " ".join(sample_words)}

    char_weights = get_unigraph_weights(summary.unigraphs)
    digraph_weights = get_digraph_weights(summary.digraphs)

    scored_words = [(word, score_word(word, char_weights, digraph_weights)) for word in word_list]
    scored_words.sort(key=lambda x: x[1], reverse=True)

    selected_words = [w for w, _ in scored_words[: settings.WORD_LIMIT]]
    return {"text": " ".join(selected_words)}


@lru_cache()
def load_word_list():
    root_path = Path(__file__).resolve().parent.parent.parent
    word_file = root_path / "text.txt"
    return [
        line.strip()
        for line in word_file.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
