from modules.user.dtos.user_create_dto import UserCreateDTO
from modules.user.entities.user_entity import UserEntity
from modules.user.repositories.interfaces import IUserRepository
from shared.exceptions.base_exceptions import BusinessRuleException
from shared.security.password_helper import PasswordHelper


class CreateUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, dto: UserCreateDTO) -> UserEntity:
        existing_users = self.repository.get_all(0, 1, email=dto.email, nome=None)
        if existing_users:
            raise BusinessRuleException("O e-mail informado já está em uso.")

        hashed_password = PasswordHelper.hash_password(dto.senha)

        user_entity = UserEntity(
            nome=dto.nome,
            email=dto.email,
            senha=hashed_password,
        )
        return self.repository.create(user_entity)
