from modules.user.repositories.interfaces import IUserRepository
from modules.user.dtos.user_create_dto import UserCreateDTO
from modules.user.entities.user_entity import UserEntity
from shared.exceptions.base_exceptions import BusinessRuleException
from shared.security.password_helper import PasswordHelper # Se estiver usando hash

class CreateUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, dto: UserCreateDTO) -> UserEntity:
        # 1. Checa se o e-mail já existe
        if self.repository.get_by_email(dto.email):
            raise BusinessRuleException("Este e-mail já está cadastrado em nossa base.")
            
        # 2. (Opcional) Checa se o CPF já existe
        # if self.repository.get_by_cpf(dto.cpf):
        #     raise BusinessRuleException("Este CPF já está vinculado a outra conta.")

        # 3. Criptografa a senha antes de salvar
        hashed_password = PasswordHelper.hash_password(dto.senha)

        # 4. Monta a entidade
        entity = UserEntity(
            nome=dto.nome,
            sobrenome=dto.sobrenome,
            idade=dto.idade,
            cep=dto.cep,
            endereco=dto.endereco,
            numero_residencia=dto.numero_residencia,
            email=dto.email,
            cpf=dto.cpf,
            senha=hashed_password,
            aceitou_termos=dto.aceitou_termos
        )

        return self.repository.create(entity)