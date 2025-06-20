import os
from functools import cached_property

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = None

    PYTHONPATH: str = "./"

    GRAPHQL_ENDPOINT: str = "/graphql"

    # Redis
    QUEUE_NAME: str = "task_queue"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Uvicorn
    DEBUG: bool = True
    RELOAD: bool = True
    UVICORN_PORT: int = 8080

    SECRET_KEY: str = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @cached_property
    def database_url(self) -> str:
        return self.DATABASE_URL  # Optional: parse or fallback if needed

    @property
    def is_test(self) -> bool:
        return os.getenv("ENV", "dev") == "test"

    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENV', 'dev')}",
        case_sensitive=True
    )


settings = Settings()
