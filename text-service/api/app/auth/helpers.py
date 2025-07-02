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
    if not data.get("details"):
        return data

    details = data["details"]

    if isinstance(details.get("unigraph_stats"), list):
        details["unigraph_stats"] = convert_stat_list_to_dict(details["unigraph_stats"])

    if isinstance(details.get("digraph_stats"), list):
        details["digraph_stats"] = convert_stat_list_to_dict(details["digraph_stats"])

    return data
