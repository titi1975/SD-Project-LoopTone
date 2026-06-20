from modules.auth.dtos.auth_login_dto import AuthLoginDTO
from modules.auth.dtos.auth_response_dto import AuthResponseDTO
from modules.user.repositories.interfaces import IUserRepository

from shared.exceptions.base_exceptions import UnauthorizedException
from shared.security.password_helper import PasswordHelper
from shared.security.jwt_helper import JWTHelper

class LoginUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository

    def execute(self, dto: AuthLoginDTO) -> AuthResponseDTO:
        user = self.repository.get_by_email(dto.email)

        # 1. Validação segura (não revela qual dos dois está errado, evitando enumeração)
        if not user or not PasswordHelper.verify_password(dto.senha, user.senha):
            raise UnauthorizedException("E-mail ou senha inválidos.")

        # -----------------------------------------------------------------
        # 🔒 TRAVA DE SEGURANÇA: CONTA VERIFICADA
        # -----------------------------------------------------------------
        # Se a senha estiver correta, mas a conta não tiver sido validada
        # com o código do Gmail, barramos a emissão do Token JWT.
        # TODO: reativar verificação de email quando SMTP estiver configurado
        # if not user.is_verified:
        #     raise UnauthorizedException(
        #         "Sua conta ainda não foi ativada. Verifique seu e-mail e insira o código de confirmação."
        #     )
        # -----------------------------------------------------------------

        # 3. Geramos o JWT verdadeiro usando o ID do usuário
        token = JWTHelper.create_access_token(user_id=user.id)

        return AuthResponseDTO(
            access_token=token,
            user=user
        )