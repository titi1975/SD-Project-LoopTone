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

router = APIRouter(prefix="/api/users", tags=["Users"])

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

@router.post("/", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreateDTO, 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = CreateUserUseCase(repo)
    return use_case.execute(data)

@router.get("/", response_model=List[UserResponseDTO], status_code=status.HTTP_200_OK)
def get_all_users(
    filters: UserFilterDTO = Depends(), # Transforma as query params da URL no DTO
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = FindAllUsersUseCase(repo)
    return use_case.execute(filters)

@router.get("/{user_id}", response_model=UserResponseDTO, status_code=status.HTTP_200_OK)
def get_user_by_id(
    user_id: int, 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = FindByIdUserUseCase(repo)
    return use_case.execute(user_id)

@router.put("/{user_id}", response_model=UserResponseDTO, status_code=status.HTTP_200_OK)
def update_user(
    user_id: int, 
    data: UserUpdateDTO, 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = UpdateUserUseCase(repo)
    return use_case.execute(user_id, data)

@router.delete("/{user_id}", response_model=MessageResponseDTO, status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int, 
    repo: UserRepository = Depends(get_user_repository)
):
    use_case = DeleteUserUseCase(repo)
    return use_case.execute(user_id)