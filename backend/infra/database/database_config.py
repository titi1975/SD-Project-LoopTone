import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL

# Carrega as variáveis soltas do arquivo .env
load_dotenv()

# Monta a URL de conexão dinamicamente usando as variáveis isoladas
DATABASE_URL = URL.create(
    drivername="postgresql",
    username=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "postgres"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", 5432)), # Converte a porta garantindo que seja um número (int)
    database=os.getenv("DB_NAME", "toneforge_db")
)

# Cria o motor de comunicação com o banco
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Fabrica as sessões do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()