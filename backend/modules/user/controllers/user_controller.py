from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from infra.database.database_config import get_db

# Importando todos os DTOs das suas respectivas origens
from modules.user.dtos.user_create_dto import UserCreateDTO
from modules.user.dtos.user_update_dto import UserUpdateDTO
from modules.user.dtos.user_filter_dto import UserFilterDTO
from modules.user.dtos.user_response_dto import UserResponseDTO, MessageResponseDTO

from modules.user.repositories.user_repository import UserRepository
from modules.user.use_cases.create_user import CreateUserUseCase
from modules.user.use_cases.find_all_users import FindAllUsersUseCase
from modules.user.use_cases.find_by_id_user import FindByIdUserUseCase
from modules.user.use_cases.update_user import UpdateUserUseCase
from modules.user.use_cases.delete_user import DeleteUserUseCase

# IMPORTAMOS OS TEXTOS DE DOCUMENTAÇÃO
from shared.documentation.api_docs import USER_DOCS

# IMPORT DA NOSSA DEPENDÊNCIA DE SEGURANÇA (O Cadeado)
from shared.security.dependencies import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["Users"])

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

@router.post(
    "/", 
    response_model=UserResponseDTO, 
    status_code=status.HTTP_201_CREATED,
    summary="Criar Conta de Usuário",
    description=USER_DOCS["create"]
)
def create_user(
    data: UserCreateDTO, 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = CreateUserUseCase(repo)
    return use_case.execute(data)

@router.get(
    "/", 
    response_model=List[UserResponseDTO], 
    status_code=status.HTTP_200_OK,
    summary="Listar Usuários",
    description=USER_DOCS["get_all"]
)
def get_all_users(
    filters: UserFilterDTO = Depends(), 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = FindAllUsersUseCase(repo)
    return use_case.execute(filters)

@router.get(
    "/{user_id}", 
    response_model=UserResponseDTO, 
    status_code=status.HTTP_200_OK,
    summary="Buscar Usuário por ID",
    description=USER_DOCS["get_by_id"]
)
def get_user_by_id(
    user_id: int, 
    repo: UserRepository = Depends(get_user_repository)
):
    # Nota: Consultar um perfil público geralmente não exige login, 
    # por isso mantemos o /{user_id} aberto aqui.
    use_case = FindByIdUserUseCase(repo)
    return use_case.execute(user_id)

# ---------------------------------------------------------
# ROTAS PROTEGIDAS (O USUÁRIO SÓ EDITA/DELETA A SI MESMO)
# ---------------------------------------------------------

@router.put(
    "/me", # MUDANÇA: Sai o "/{user_id}" e entra o "/me"
    response_model=UserResponseDTO, 
    status_code=status.HTTP_200_OK,
    summary="Atualizar Meu Perfil", # Ajuste no título
    description=USER_DOCS["update"]
)
def update_user(
    data: UserUpdateDTO, 
    # CADEADO APLICADO: A API extrai o ID diretamente do Token JWT
    current_user_id: int = Depends(get_current_user_id), 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = UpdateUserUseCase(repo)
    # Passamos o ID seguro extraído do token para o Use Case
    return use_case.execute(current_user_id, data)

@router.delete(
    "/me", # MUDANÇA: Sai o "/{user_id}" e entra o "/me"
    response_model=MessageResponseDTO, 
    status_code=status.HTTP_200_OK,
    summary="Deletar Minha Conta", # Ajuste no título
    description=USER_DOCS["delete"]
)
def delete_user(
    # CADEADO APLICADO
    current_user_id: int = Depends(get_current_user_id), 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = DeleteUserUseCase(repo)
    # Passamos o ID seguro extraído do token para o Use Case
    return use_case.execute(current_user_id)