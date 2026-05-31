from modules.equipment.repositories.equipment_repository import EquipmentRepository
from shared.exceptions.base_exceptions import NotFoundException


class DeleteEquipmentUseCase:
    def __init__(self, repository: EquipmentRepository):
        self.repository = repository

    def execute(self, equipment_id: int) -> dict[str, str]:
        equipment = self.repository.get_by_id(equipment_id)
        if not equipment:
            raise NotFoundException("Equipamento nao encontrado.")

        self.repository.delete(equipment)
        return {"message": "Equipamento removido com sucesso."}
