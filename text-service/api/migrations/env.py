import asyncio
from logging.config import fileConfig
from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from api.app.factories.database import Base
from api.app.settings import settings

# Required to populate Base.metadata


# 🔧 Alembic Config
config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

# 🪵 Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 📐 Metadata for 'autogenerate'
target_metadata = Base.metadata


# 🧾 Offline mode
def run_migrations_offline():
    context.configure(
        url=config.get_main_option("sqlalchemy.url").replace("postgresql://", "postgresql+asyncpg://"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# 🔁 Online mode
def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url").replace("postgresql://", "postgresql+asyncpg://"),
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


# 🚀 Run the appropriate mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
