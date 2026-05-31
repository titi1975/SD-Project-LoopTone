from typing import List
from modules.user.repositories.interfaces import IUserRepository
from modules.user.entities.user_entity import UserEntity
from modules.user.dtos.user_filter_dto import UserFilterDTO

class FindAllUsersUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, filters: UserFilterDTO) -> List[UserEntity]:
        # O Use Case agora recebe o DTO de filtro
        return self.repository.get_all(
            skip=filters.skip, 
            limit=filters.limit, 
            nome=filters.nome, 
            email=filters.email
        )