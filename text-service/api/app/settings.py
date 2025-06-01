import os
from pathlib import Path, PosixPath
from typing import ClassVar, Union, Optional

from pydantic import PostgresDsn, AnyUrl, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_ROOT: ClassVar[PosixPath] = Path(__file__).parent.parent.parent.resolve()
    database_path: ClassVar[PosixPath] = PROJECT_ROOT / "development.db"

    testing: bool = False
    database_url: Optional[Union[PostgresDsn, AnyUrl]] = None

    @model_validator(mode="before")
    @classmethod
    def populate_database_url(cls, values):
        if values.get("database_url"):
            return values

        if values.get("testing", False):
            values["database_url"] = "sqlite:///:memory:"
        else:
            values["database_url"] = f"sqlite:///{cls.database_path}"

        return values

    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENV', 'development')}",
        case_sensitive=False,
        env_prefix='',
    )


settings = Settings()
print(settings.database_url)
