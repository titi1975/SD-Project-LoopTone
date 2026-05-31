from modules.user.repositories.interfaces import IUserRepository
from shared.exceptions.base_exceptions import NotFoundException
from modules.user.dtos.user_response_dto import MessageResponseDTO

class DeleteUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, user_id: int) -> MessageResponseDTO:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("Usuário não encontrado para deleção.")
        
        self.repository.delete(user)
        # Retorna o DTO de mensagem configurado
        return MessageResponseDTO(message="Usuário removido com sucesso.")