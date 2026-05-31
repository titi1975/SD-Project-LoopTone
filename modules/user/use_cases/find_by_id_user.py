from modules.user.repositories.interfaces import IUserRepository
from modules.user.entities.user_entity import UserEntity
from shared.exceptions.base_exceptions import NotFoundException

class FindByIdUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, user_id: int) -> UserEntity:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("Usuário não encontrado.")
        return user