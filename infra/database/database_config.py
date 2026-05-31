import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
from typing import Generator

# Carrega as variáveis do .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Criação da Engine (comunicação física com o DB)
engine = create_engine(DATABASE_URL, pool_pre_ping=True) # pool_pre_ping evita conexões "fantasmas" que caíram

# Fábrica de sessões (Unit of Work) configurada para gerenciar transações manualmente
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Função geradora para Injeção de Dependência no FastAPI
def get_db() -> Generator[Session, None, None]:
    """
    Injeção de dependência para instanvciar a conexão com o banco.
    O 'yield' garante que a sessão fechada após o request, indepentemente de erros.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()