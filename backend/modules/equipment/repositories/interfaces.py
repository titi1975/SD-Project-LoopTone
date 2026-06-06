from abc import ABC, abstractmethod
from typing import List, Optional
from modules.equipment.entities.equipment_entity import EquipmentEntity

class IEquipmentRepository(ABC):
    @abstractmethod
    def create(self, equipment: EquipmentEntity) -> EquipmentEntity: pass
    
    @abstractmethod
    def get_by_id(self, equipment_id: int) -> Optional[EquipmentEntity]: pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: int) -> List[EquipmentEntity]: pass
    
    @abstractmethod
    def update(self, equipment: EquipmentEntity) -> EquipmentEntity: pass
    
    @abstractmethod
    def delete(self, equipment: EquipmentEntity) -> None: pass