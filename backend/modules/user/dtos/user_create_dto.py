import re
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from pydantic.alias_generators import to_camel
from modules.user.utils.validators import is_valid_cpf, is_strong_password

class UserCreateDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    aceitou_termos: bool = Field(..., description="Obrigatório marcar como true para criar a conta.")

    @field_validator('aceitou_termos')
    @classmethod
    def validate_termos(cls, v: bool) -> bool:
        if v is not True:
            raise ValueError("Você deve aceitar os termos de uso e políticas de privacidade para se cadastrar.")
        return v

    nome: str = Field(..., min_length=2, max_length=20, pattern=r'^[a-zA-ZÀ-ÿ0-9 ]+$')
    sobrenome: str = Field(..., min_length=2, max_length=50, pattern=r'^[a-zA-ZÀ-ÿ0-9 ]+$')
    idade: int = Field(..., gt=0, lt=150)
    cep: str = Field(..., pattern=r'^\d{8}$')
    
    # MUDANÇA: Removido o pattern para permitir caracteres especiais (!, &, ., etc) e min_length delegado ao field_validator
    endereco: str = Field(..., max_length=50)
    
    numero_residencia: int = Field(..., gt=0, le=10000)
    email: EmailStr 
    cpf: str = Field(..., min_length=11, max_length=11)
    senha: str = Field(..., min_length=8)

    @field_validator('nome', 'sobrenome', 'endereco')
    @classmethod
    def prevent_double_spaces(cls, v: str) -> str:
        if "  " in v:
            raise ValueError("Não pode conter espaços seguidos.")
        return v

    # NOVA VALIDAÇÃO DO ENDEREÇO
    @field_validator('endereco')
    @classmethod
    def validate_endereco_logic(cls, v: str) -> str:
        # Extrai apenas as letras (incluindo acentos) e números da string
        alfanumericos = re.findall(r'[a-zA-Z0-9À-ÿ]', v)
        
        if len(alfanumericos) < 4:
            raise ValueError("O endereço deve conter pelo menos 4 letras ou números.")
        return v

    @field_validator('cpf')
    @classmethod
    def validate_cpf_logic(cls, v: str) -> str:
        if not is_valid_cpf(v):
            raise ValueError("CPF inválido.")
        return v

    @field_validator('senha')
    @classmethod
    def validate_password_logic(cls, v: str) -> str:
        if not is_strong_password(v):
            raise ValueError("Senha fraca.")
        return v