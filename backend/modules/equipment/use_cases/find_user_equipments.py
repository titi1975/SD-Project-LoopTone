from typing import List
from modules.equipment.repositories.interfaces import IEquipmentRepository
from modules.equipment.entities.equipment_entity import EquipmentEntity

class FindUserEquipmentsUseCase:
    def __init__(self, repository: IEquipmentRepository):
        self.repository = repository

    def execute(self, user_id: int) -> List[EquipmentEntity]:
        return self.repository.get_by_user_id(user_id)