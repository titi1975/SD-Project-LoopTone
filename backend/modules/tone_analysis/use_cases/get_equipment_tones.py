from typing import List
from modules.tone_analysis.repositories.tone_repository import ToneRepository
from modules.equipment.repositories.interfaces import IEquipmentRepository
from modules.tone_analysis.entities.tone_entity import ToneEntity
from shared.exceptions.base_exceptions import NotFoundException

class GetEquipmentTonesUseCase:
    def __init__(self, equipment_repo: IEquipmentRepository, tone_repo: ToneRepository):
        self.equipment_repo = equipment_repo
        self.tone_repo = tone_repo

    def execute(self, user_id: int, equipment_id: int) -> List[ToneEntity]:
        # 1. Trava de Segurança (IDOR): O setup existe e pertence ao usuário?
        equipment = self.equipment_repo.get_by_id(equipment_id)
        if not equipment or equipment.user_id != user_id:
            raise NotFoundException("Setup não encontrado ou não pertence a você.")

        # 2. Retorna a lista de timbres salvos
        return self.tone_repo.get_all_by_equipment(equipment_id)