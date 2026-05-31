import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

try:
    from dotenv import load_dotenv

    load_dotenv()
except ModuleNotFoundError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./looptone.db")
engine_options = {"pool_pre_ping": True}

if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate_sqlite_user_schema() -> None:
    if not DATABASE_URL.startswith("sqlite"):
        return

    legacy_columns = {"sobrenome", "idade", "cep", "endereco", "numero_residencia", "cpf"}

    with engine.connect() as connection:
        table_rows = connection.exec_driver_sql("PRAGMA table_info(users)").mappings().all()
        current_columns = {row["name"] for row in table_rows}

        if not current_columns or legacy_columns.isdisjoint(current_columns):
            return

        connection.exec_driver_sql("PRAGMA foreign_keys=OFF")
        connection.exec_driver_sql(
            """
            CREATE TABLE users_new (
                id INTEGER NOT NULL PRIMARY KEY,
                nome VARCHAR(20) NOT NULL,
                email VARCHAR(100) NOT NULL,
                senha VARCHAR(255) NOT NULL,
                ativo BOOLEAN
            )
            """
        )
        connection.exec_driver_sql(
            """
            INSERT INTO users_new (id, nome, email, senha, ativo)
            SELECT id, nome, email, senha, COALESCE(ativo, 1)
            FROM users
            """
        )
        connection.exec_driver_sql("DROP TABLE users")
        connection.exec_driver_sql("ALTER TABLE users_new RENAME TO users")
        connection.exec_driver_sql("CREATE UNIQUE INDEX ix_users_email ON users (email)")
        connection.exec_driver_sql("CREATE INDEX ix_users_id ON users (id)")
        connection.exec_driver_sql("PRAGMA foreign_keys=ON")
        connection.commit()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
