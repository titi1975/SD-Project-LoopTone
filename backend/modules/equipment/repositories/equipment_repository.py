from typing import List, Optional
from sqlalchemy.orm import Session

from modules.equipment.entities.equipment_entity import EquipmentEntity
from modules.equipment.repositories.interfaces import IEquipmentRepository

class EquipmentRepository(IEquipmentRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, equipment: EquipmentEntity) -> EquipmentEntity:
        self.db.add(equipment)
        self.db.commit()
        self.db.refresh(equipment)
        return equipment

    def get_by_id(self, equipment_id: int) -> Optional[EquipmentEntity]:
        return self.db.query(EquipmentEntity).filter(EquipmentEntity.id == equipment_id).first()

    def get_by_user_id(self, user_id: int) -> List[EquipmentEntity]:
        return self.db.query(EquipmentEntity).filter(EquipmentEntity.user_id == user_id).all()

    def update(self, equipment: EquipmentEntity) -> EquipmentEntity:
        self.db.commit()
        self.db.refresh(equipment)
        return equipment

    def delete(self, equipment: EquipmentEntity) -> None:
        self.db.delete(equipment)
        self.db.commit()

    def update(self, equipment: EquipmentEntity) -> EquipmentEntity:
        """Salva alterações feitas em um equipamento existente."""
        self.db.commit()
        self.db.refresh(equipment)
        return equipment