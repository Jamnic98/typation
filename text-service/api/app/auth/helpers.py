from functools import wraps

from graphql import GraphQLError
from strawberry.types import Info



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



def convert_stat_list_to_dict(stat_list):
    result = {}
    for entry in stat_list:
        key = entry["key"]
        data = {
            "count": entry["count"],
            "accuracy": entry["accuracy"],
            "mean_interval": entry.get("mean_interval", entry.get("meanInterval"))
        }
        result[key] = data
    return result


def normalise_user_stats_input(data: dict) -> dict:
    if isinstance(data.get("unigraphs"), list):
        data["unigraphs"] = convert_stat_list_to_dict(data["unigraphs"])

    if isinstance(data.get("digraphs"), list):
        data["digraphs"] = convert_stat_list_to_dict(data["digraphs"])

    return data
