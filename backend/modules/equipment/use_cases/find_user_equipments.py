from typing import List

from modules.equipment.entities.equipment_entity import EquipmentEntity
from modules.equipment.repositories.equipment_repository import EquipmentRepository


class FindUserEquipmentsUseCase:
    def __init__(self, repository: EquipmentRepository):
        self.repository = repository

    def execute(self, user_id: int) -> List[EquipmentEntity]:
        return self.repository.get_by_user_id(user_id)
