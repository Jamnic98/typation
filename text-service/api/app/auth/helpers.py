from functools import wraps

from strawberry.types import Info
from strawberry.exceptions import GraphQLError


def require_auth(info: Info):
    user = info.context.get("user")
    if not user:
        raise GraphQLError("Authentication required")
    return user

def auth_required(func):
    @wraps(func)
    async def wrapper(*args, info: Info, **kwargs):
        require_auth(info)
        return await func(*args, info=info, **kwargs)
    return wrapper
