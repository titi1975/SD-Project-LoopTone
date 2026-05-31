from modules.equipment.dtos.equipment_create_dto import EquipmentCreateDTO
from modules.equipment.entities.equipment_entity import EquipmentEntity
from modules.equipment.repositories.equipment_repository import EquipmentRepository


class CreateEquipmentUseCase:
    def __init__(self, repository: EquipmentRepository):
        self.repository = repository

    def execute(self, dto: EquipmentCreateDTO) -> EquipmentEntity:
        equipment = EquipmentEntity(
            user_id=dto.user_id,
            name=dto.name,
            category=dto.category,
        )
        return self.repository.create(equipment)
