from datetime import datetime


def get_unigraph_weights(unigraphs: list) -> dict[str, float]:
    weights = {}
    for uni in unigraphs:
        total = uni.count or 1
        errors = len(uni.mistyped) if uni.mistyped else 0
        accuracy = (total - errors) / total
        weights[uni.key.lower()] = round(1 - (accuracy / 100), 3)
    return weights


def get_digraph_weights(digraphs: list) -> dict[str, float]:
    weights = {}
    for di in digraphs:
        weights[di.key.lower()] = round(1 - (di.accuracy / 100), 3)
    return weights


def score_word(word: str, unigraph_weights: dict[str, float], digraph_weights: dict[str, float]) -> float:
    score = 0.0
    word = word.lower()
    for i, c in enumerate(word):
        score += unigraph_weights.get(c, 0.0)
        if i > 0:
            digraph = word[i - 1] + c
            score += digraph_weights.get(digraph, 0.0)
    return score


def to_timestamp(dt: datetime) -> float:
    return dt.timestamp() if dt else 0.0
