from typing import Any
from mangum import Mangum

from .factories.fastapi_app import create_app

app = create_app()

def handler(event: dict, _context=None) -> Any:
    asgi_handler = Mangum(app)
    return asgi_handler(event, _context)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
