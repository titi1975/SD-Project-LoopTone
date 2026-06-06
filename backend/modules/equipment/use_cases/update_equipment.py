from modules.equipment.repositories.interfaces import IEquipmentRepository
from modules.equipment.dtos.equipment_update_dto import EquipmentUpdateDTO
from modules.equipment.entities.equipment_entity import EquipmentEntity
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException

class UpdateEquipmentUseCase:
    def __init__(self, repository: IEquipmentRepository):
        self.repository = repository

    def execute(self, equipment_id: int, dto: EquipmentUpdateDTO) -> EquipmentEntity:
        equipment = self.repository.get_by_id(equipment_id)
        if not equipment:
            raise NotFoundException("Setup de equipamento não encontrado.")

        if dto.profile_name and dto.profile_name.lower() != equipment.profile_name.lower():
            user_equipments = self.repository.get_by_user_id(equipment.user_id)
            for eq in user_equipments:
                if eq.profile_name.lower() == dto.profile_name.lower() and eq.id != equipment_id:
                    raise BusinessRuleException(f"Você já possui um setup chamado '{dto.profile_name}'.")

        update_data = dto.model_dump(exclude_unset=True)

        if "instrument" in update_data:
            equipment.instrument_brand = update_data["instrument"]["brand"]
            equipment.instrument_model = update_data["instrument"]["model"]
            del update_data["instrument"]

        if "amps" in update_data:
            update_data["amps"] = [amp for amp in update_data["amps"]] 

        for key, value in update_data.items():
            setattr(equipment, key, value)

        return self.repository.update(equipment)