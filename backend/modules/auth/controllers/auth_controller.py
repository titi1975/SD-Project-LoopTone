from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from infra.database.database_config import get_db
from modules.auth.dtos.auth_login_dto import AuthLoginDTO
from modules.auth.dtos.auth_response_dto import AuthResponseDTO
from modules.auth.use_cases.login_user import LoginUserUseCase
from modules.user.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


@router.post("/login", response_model=AuthResponseDTO, status_code=status.HTTP_200_OK)
def login(
    data: AuthLoginDTO,
    repo: UserRepository = Depends(get_user_repository),
):
    use_case = LoginUserUseCase(repo)
    return use_case.execute(data)
