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
    return {entry["key"]: {"count": entry["count"], "accuracy": entry["accuracy"]} for entry in stat_list}

def convert_timing_list_to_dict(timing_list):
    return {entry["key"]: entry["intervals"] for entry in timing_list}

def normalise_user_stats_input(data: dict) -> dict:
    if not data.get("details"):
        return data

    details = data["details"]

    if isinstance(details.get("unigraph_stats"), list):
        details["unigraph_stats"] = convert_stat_list_to_dict(details["unigraph_stats"])

    if isinstance(details.get("digraph_stats"), list):
        details["digraph_stats"] = convert_stat_list_to_dict(details["digraph_stats"])

    if isinstance(details.get("digraph_timings"), list):
        details["digraph_timings"] = convert_timing_list_to_dict(details["digraph_timings"])

    return data
