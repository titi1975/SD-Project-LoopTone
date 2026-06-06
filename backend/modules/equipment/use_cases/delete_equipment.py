from modules.equipment.repositories.interfaces import IEquipmentRepository
from shared.exceptions.base_exceptions import NotFoundException
from modules.user.dtos.user_response_dto import MessageResponseDTO

class DeleteEquipmentUseCase:
    def __init__(self, repository: IEquipmentRepository):
        self.repository = repository

    def execute(self, equipment_id: int) -> MessageResponseDTO:
        equipment = self.repository.get_by_id(equipment_id)
        
        if not equipment:
            raise NotFoundException("Setup de equipamento não encontrado para deleção.")
        
        self.repository.delete(equipment)
        
        return MessageResponseDTO(message="Setup de equipamento removido com sucesso.")