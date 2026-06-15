from modules.tone_analysis.repositories.tone_repository import ToneRepository
from shared.exceptions.base_exceptions import NotFoundException

class DeleteToneUseCase:
    def __init__(self, tone_repo: ToneRepository):
        self.tone_repo = tone_repo

    def execute(self, user_id: int, tone_id: int) -> None:
        # 1. Busca o timbre no banco de dados
        tone = self.tone_repo.get_by_id(tone_id)
        
        # 2. Proteção de Segurança: Se não existir ou se o setup do timbre 
        # não pertencer ao usuário logado, barramos com 404 por segurança (evita vazamento de informação)
        if not tone or tone.equipment.user_id != user_id:
            raise NotFoundException("Timbre não encontrado em seu laboratório ou não pertence a você.")
        
        # 3. Executa a remoção
        self.tone_repo.delete(tone_id)