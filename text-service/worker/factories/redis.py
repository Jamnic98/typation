from redis import Redis


from worker.settings import settings


def create_redis_client():
    return Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)
