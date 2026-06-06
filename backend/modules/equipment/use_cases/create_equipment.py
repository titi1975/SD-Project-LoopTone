from modules.equipment.repositories.interfaces import IEquipmentRepository
from modules.equipment.dtos.equipment_create_dto import EquipmentCreateDTO
from modules.equipment.entities.equipment_entity import EquipmentEntity
from shared.exceptions.base_exceptions import BusinessRuleException

class CreateEquipmentUseCase:
    def __init__(self, repository: IEquipmentRepository):
        self.repository = repository

    def execute(self, dto: EquipmentCreateDTO) -> EquipmentEntity:
        user_equipments = self.repository.get_by_user_id(dto.user_id)
        
        if len(user_equipments) >= 5:
            raise BusinessRuleException("O usuário já atingiu o limite máximo de 5 setups de equipamento.")

        for eq in user_equipments:
            if eq.profile_name.lower() == dto.profile_name.lower():
                raise BusinessRuleException(f"Você já possui um setup chamado '{dto.profile_name}'.")

        amps_data = [amp.model_dump() for amp in dto.amps]

        entity = EquipmentEntity(
            user_id=dto.user_id,
            profile_name=dto.profile_name,
            instrument_type=dto.instrument_type,
            instrument_brand=dto.instrument.brand, 
            instrument_model=dto.instrument.model, 
            amps=amps_data,
            pedals=dto.pedals,
            daws=dto.daws
        )

        return self.repository.create(entity)