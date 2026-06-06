from sqlalchemy import Column, Integer, String, Boolean
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
    senha = Column(String(255), nullable=False) # Guardará o hash, por isso 255
    ativo = Column(Boolean, default=True) # Soft delete / Status
    aceitou_termos = Column(Boolean, nullable=False)