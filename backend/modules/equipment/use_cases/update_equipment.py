from modules.equipment.dtos.equipment_update_dto import EquipmentUpdateDTO
from modules.equipment.entities.equipment_entity import EquipmentEntity
from modules.equipment.repositories.equipment_repository import EquipmentRepository
from shared.exceptions.base_exceptions import NotFoundException


class UpdateEquipmentUseCase:
    def __init__(self, repository: EquipmentRepository):
        self.repository = repository

    def execute(self, equipment_id: int, dto: EquipmentUpdateDTO) -> EquipmentEntity:
        equipment = self.repository.get_by_id(equipment_id)
        if not equipment:
            raise NotFoundException("Equipamento nao encontrado.")

        equipment.name = dto.name
        equipment.category = dto.category
        return self.repository.update(equipment)
