from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship 
from sqlalchemy.sql import func
from infra.database.base_entity import Base

class EquipmentEntity(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    profile_name = Column(String(50), nullable=False)
    instrument_type = Column(String(20), nullable=False)
    
    instrument_brand = Column(String(20), nullable=False)
    instrument_model = Column(String(20), nullable=False)
    
    amps = Column(JSONB, nullable=False) 
    pedals = Column(ARRAY(String(50)), nullable=False)
    daws = Column(ARRAY(String(50)), nullable=True)

    # --- NOVO SISTEMA DE CRÉDITOS DIÁRIOS (POR SETUP) ---
    creditos_ia = Column(Integer, nullable=False, default=10) # 10 análises diárias por setup
    ultimo_reset_creditos = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # ----------------------------------------------------

    tones = relationship("ToneEntity", backref="equipment", cascade="all, delete-orphan")

    @property
    def instrument(self):
        return {
            "brand": self.instrument_brand, 
            "model": self.instrument_model
        }