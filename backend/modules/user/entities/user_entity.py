from sqlalchemy import Column, Integer, String, Boolean, DateTime
from infra.database.base_entity import Base

class UserEntity(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(20), nullable=False)
    sobrenome = Column(String(50), nullable=False)
    idade = Column(Integer, nullable=False)
    cep = Column(String(8), nullable=False)
    endereco = Column(String(50), nullable=False)
    numero_residencia = Column(Integer, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    cpf = Column(String(11), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True) 
    aceitou_termos = Column(Boolean, nullable=False)

    # --- NOVAS COLUNAS: VERIFICAÇÃO E RECUPERAÇÃO ---
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_code = Column(String(6), nullable=True) # Código de 6 dígitos
    reset_token = Column(String(64), nullable=True)      # Token longo para recuperar senha
    token_expiration = Column(DateTime(timezone=True), nullable=True) # Validade do código/token