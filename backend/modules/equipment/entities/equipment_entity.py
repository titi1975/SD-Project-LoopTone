from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
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

    @property
    def instrument(self):
        return {
            "brand": self.instrument_brand, 
            "model": self.instrument_model
        }