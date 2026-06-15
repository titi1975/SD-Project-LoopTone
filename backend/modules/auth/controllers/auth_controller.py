import secrets
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

# Importações de Infra e Repositórios
from infra.database.database_config import get_db
from modules.user.repositories.user_repository import UserRepository

# Importações de DTOs e Casos de Uso
from modules.auth.dtos.auth_login_dto import AuthLoginDTO
from modules.auth.dtos.auth_response_dto import AuthResponseDTO
from modules.auth.dtos.auth_verification_dto import VerifyEmailDTO, ForgotPasswordDTO, ResetPasswordDTO
from modules.auth.use_cases.login_user import LoginUserUseCase

# Importações Compartilhadas (Serviços, Exceções e Segurança)
from shared.services.email_service import EmailService
from shared.documentation.api_docs import AUTH_DOCS
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException
from shared.security.password_helper import PasswordHelper

router = APIRouter(prefix="/api/auth", tags=["Auth"])

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

@router.post(
    "/login", 
    response_model=AuthResponseDTO, 
    status_code=status.HTTP_200_OK,
    summary="Realizar Login na Plataforma",
    description=AUTH_DOCS.get("login", "Endpoint para autenticação de usuários")
)
def login(
    data: AuthLoginDTO,
    repo: UserRepository = Depends(get_user_repository),
):
    # O Controller delega a responsabilidade limpa para o Caso de Uso
    use_case = LoginUserUseCase(repo)
    return use_case.execute(data)

@router.post(
    "/verify-email", 
    status_code=status.HTTP_200_OK,
    summary="Confirmar conta via Código"
)
def verify_email(data: VerifyEmailDTO, repo: UserRepository = Depends(get_user_repository)):
    user = repo.get_by_email(data.email)
    if not user:
        raise NotFoundException("Usuário não encontrado.")
    
    if user.is_verified:
        return {"message": "Sua conta já está verificada!"}
        
    if user.verification_code != data.code:
        raise BusinessRuleException("Código inválido.")
        
    # Proteção contra erros de timezone do banco de dados (Naive vs Aware)
    expiration = user.token_expiration
    if expiration and expiration.tzinfo is None:
        expiration = expiration.replace(tzinfo=timezone.utc)
        
    if not expiration or datetime.now(timezone.utc) > expiration:
        raise BusinessRuleException("O código expirou. Solicite um novo.")
        
    # Efetiva a validação e limpa o código
    user.is_verified = True
    user.verification_code = None
    repo.update(user)
    
    return {"message": "E-mail confirmado com sucesso! Você já pode fazer login."}

@router.post(
    "/forgot-password", 
    status_code=status.HTTP_200_OK,
    summary="Solicitar redefinição de senha"
)
def forgot_password(data: ForgotPasswordDTO, repo: UserRepository = Depends(get_user_repository)):
    user = repo.get_by_email(data.email)
    if not user:
        # Por segurança, retornamos OK mesmo se não achar, para evitar enumeração de usuários (vazamento de dados)
        return {"message": "Se o e-mail existir, um link de recuperação foi enviado."}
        
    token = secrets.token_urlsafe(32) # Gera um token seguro de 32 bytes
    user.reset_token = token
    user.token_expiration = datetime.now(timezone.utc) + timedelta(hours=1) # Expira em 1 hora
    repo.update(user)
    
    email_service = EmailService()
    email_service.send_password_reset_email(user.email, token, user.nome)
    
    return {"message": "Se o e-mail existir, um link de recuperação foi enviado."}

@router.post(
    "/reset-password", 
    status_code=status.HTTP_200_OK,
    summary="Redefinir a senha"
)
def reset_password(data: ResetPasswordDTO, repo: UserRepository = Depends(get_user_repository)):
    user = repo.get_by_email(data.email)
    if not user or user.reset_token != data.reset_token:
        raise BusinessRuleException("Token inválido ou usuário não encontrado.")
        
    expiration = user.token_expiration
    if expiration and expiration.tzinfo is None:
        expiration = expiration.replace(tzinfo=timezone.utc)
        
    if not expiration or datetime.now(timezone.utc) > expiration:
        raise BusinessRuleException("O token expirou. Solicite a recuperação novamente.")
        
    # Transforma a nova senha em hash usando a sua classe de segurança
    user.senha = PasswordHelper.hash_password(data.nova_senha)
    
    user.reset_token = None # Invalida o token após o uso para que não seja reutilizado
    repo.update(user)
    
    return {"message": "Sua senha foi alterada com sucesso!"}