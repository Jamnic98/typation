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


def convert_stat_list_to_dict(stat_list, include_mean_interval=False):
    result = {}
    for entry in stat_list:
        key = entry["key"]
        data = {
            "count": entry["count"],
            "accuracy": entry["accuracy"],
        }
        if include_mean_interval:
            mean_interval = entry.get("mean_interval", entry.get("meanInterval"))
            if mean_interval is not None:
                data["mean_interval"] = mean_interval

        if "mistyped" in entry:
            data["mistyped"] = entry["mistyped"]
        result[key] = data
    return result


def normalise_user_stats_input(data: dict) -> dict:
    # Normalize unigraphs
    if isinstance(data.get("unigraphs"), list):
        for unigraph in data["unigraphs"]:
            mistyped_list = unigraph.get("mistyped")
            if isinstance(mistyped_list, list):
                unigraph["mistyped"] = {entry["key"]: entry["count"] for entry in mistyped_list}

        # Convert list of unigraphs to dict keyed by 'key', exclude mean_interval for unigraphs
        data["unigraphs"] = convert_stat_list_to_dict(data["unigraphs"], include_mean_interval=False)

    # Normalize digraphs
    if isinstance(data.get("digraphs"), list):
        # Convert list of digraph dicts to a dict keyed by 'key'
        data["digraphs"] = {
            item["key"]: {k: v for k, v in item.items() if k != "key"}
            for item in data["digraphs"]
        }
        # No need to convert mistyped here because digraphs don't have mistyped

    return data
