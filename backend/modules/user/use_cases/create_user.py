import os
import random
import string
from datetime import datetime, timezone, timedelta

from modules.user.repositories.interfaces import IUserRepository
from modules.user.dtos.user_create_dto import UserCreateDTO
from modules.user.entities.user_entity import UserEntity
from shared.exceptions.base_exceptions import BusinessRuleException
from shared.security.password_helper import PasswordHelper

# IMPORT DO SERVIÇO DE DISPARO DE E-MAILS
from shared.services.email_service import EmailService

class CreateUserUseCase:
    def __init__(self, repository: IUserRepository):
        self.repository = repository
        # Injeção do serviço transacional de e-mail
        self.email_service = EmailService()

    def execute(self, dto: UserCreateDTO) -> UserEntity:
        # 1. Checa se o e-mail já existe
        if self.repository.get_by_email(dto.email):
            raise BusinessRuleException("Este e-mail já está cadastrado em nossa base.")
            
        # 2. Criptografa a senha antes de salvar
        hashed_password = PasswordHelper.hash_password(dto.senha)

        # 3. Regra de Bypass para o Usuário de Teste do Desenvolvedor
        # Busca o e-mail master do .env. Se não achar, assume 'dev@looptone.com' como padrão de segurança.
        email_desenvolvedor = os.getenv("TEST_USER_EMAIL", "dev@looptone.com")
        
        is_verified = False
        verification_code = None
        token_expiration = None

        if dto.email == email_desenvolvedor:
            # O usuário de teste pula a etapa de e-mail e já nasce ativo
            is_verified = True
        else:
            # Gera um código numérico aleatório de 6 dígitos para usuários comuns
            verification_code = ''.join(random.choices(string.digits, k=6))
            # Define o tempo de expiração estrito para 15 minutos a partir de agora em UTC
            token_expiration = datetime.now(timezone.utc) + timedelta(minutes=15)

        # 4. Monta a entidade incluindo os novos campos de controle de estado
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
            aceitou_termos=dto.aceitou_termos,
            
            # Injeção dos estados de ativação
            is_verified=is_verified,
            verification_code=verification_code,
            token_expiration=token_expiration
        )

        # 5. Persiste o usuário no banco de dados
        created_user = self.repository.create(entity)

        # 6. Dispara o e-mail se não for o usuário de testes
        if not is_verified and verification_code:
            self.email_service.send_verification_email(
                recipient_email=created_user.email,
                code=verification_code,
                user_name=created_user.nome
            )

        return created_user