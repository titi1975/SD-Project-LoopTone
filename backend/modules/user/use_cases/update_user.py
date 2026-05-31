from modules.user.repositories.interfaces import IUserRepository
from modules.user.dtos.user_update_dto import UserUpdateDTO
from modules.user.entities.user_entity import UserEntity
from shared.security.password_helper import PasswordHelper
from shared.exceptions.base_exceptions import NotFoundException

class UpdateUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, user_id: int, dto: UserUpdateDTO) -> UserEntity:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("Usuário não encontrado para atualização.")
        
        update_data = dto.model_dump(exclude_unset=True)
        
        if "senha" in update_data:
            update_data["senha"] = PasswordHelper.hash_password(update_data["senha"])
            
        for key, value in update_data.items():
            setattr(user, key, value)
            
        return self.repository.update(user)