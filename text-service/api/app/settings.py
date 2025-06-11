import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PYTHONPATH: str = "./"

    # redis settings
    QUEUE_NAME: str = "task_queue"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # uvicorn settings
    DEBUG: bool = True
    RELOAD: bool = True
    UVICORN_PORT: int = 8080

    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"

    @property
    def is_test(self):
        return os.getenv("ENV", "dev") == "test"

    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENV', 'dev')}",
        case_sensitive=True
    )

settings = Settings()
