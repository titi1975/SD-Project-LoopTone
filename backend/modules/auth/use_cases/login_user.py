from secrets import token_urlsafe

from modules.auth.dtos.auth_login_dto import AuthLoginDTO
from modules.auth.dtos.auth_response_dto import AuthResponseDTO
from modules.user.repositories.interfaces import IUserRepository
from shared.exceptions.base_exceptions import BusinessRuleException
from shared.security.password_helper import PasswordHelper


class LoginUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, dto: AuthLoginDTO) -> AuthResponseDTO:
        user = self.repository.get_by_email(dto.email)

        if not user or not PasswordHelper.verify_password(dto.senha, user.senha):
            raise BusinessRuleException("E-mail ou senha inválidos.")

        return AuthResponseDTO(
            access_token=token_urlsafe(32),
            user=user,
        )
