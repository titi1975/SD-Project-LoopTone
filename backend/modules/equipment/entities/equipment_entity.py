from sqlalchemy import Column, ForeignKey, Integer, String

from infra.database.base_entity import Base


class EquipmentEntity(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(80), nullable=False)
    category = Column(String(40), nullable=False)
