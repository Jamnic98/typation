import os
from pathlib import PosixPath, Path
from typing import ClassVar, Union, Optional

from pydantic import PostgresDsn, AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_ROOT: ClassVar[PosixPath] = Path(__file__).parent.parent.parent.resolve()
    database_path: ClassVar[PosixPath] = PROJECT_ROOT / "development.db"

    testing: bool = False
    database_url: Optional[Union[PostgresDsn, AnyUrl]] = None

    @classmethod
    def assemble_database_url(cls, v):
        if v is not None:
            return v
        return f"sqlite:///{cls.database_path}"

    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENV', 'development')}",
        case_sensitive=False,
        env_prefix='',  # no prefix, so DATABASE_URL env var maps directly
    )


settings = Settings()
