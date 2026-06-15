from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from infra.database.base_entity import Base

class ToneEntity(Base):
    __tablename__ = "tones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Chave Estrangeira: Este timbre pertence a qual Setup (Equipamento)?
    equipment_id = Column(Integer, ForeignKey("equipments.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Identificador amigável para o usuário
    nome_personalizado = Column(String(100), nullable=False, default="Meu Timbre")
    
    # Metadados do Alvo (O que o usuário tentou alcançar - Opcionais)
    target_artist = Column(String(100), nullable=True) 
    target_song = Column(String(100), nullable=True)
    
    # O Resultado da IA (Os Structured Outputs)
    analysis_summary = Column(String, nullable=False)
    adjustments = Column(ARRAY(String), nullable=False)
    missing_elements = Column(ARRAY(String), nullable=False)
    
    # Metadados do Sistema
    created_at = Column(DateTime(timezone=True), server_default=func.now())