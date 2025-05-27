from random import shuffle

from fastapi import APIRouter

practice_router = APIRouter(prefix='/practice')


@practice_router.post('/generate-text')
async def generate_text():
    input_text = (
        f'the quick brown fox jumps over the lazy dog'
        f'Pack my box with five dozen liquor jugs'
        f'Waltz, bad nymph, for quick jigs vex'
        f'The five boxing wizards jump quickly'
        f'Jackdaws love my big sphinx of quartz'
        f'How vexingly quick daft zebras jump!'
    )

    words = input_text.split(' ')
    shuffle(words)
    output_text = ' '.join(words)
    return {'text': output_text}
