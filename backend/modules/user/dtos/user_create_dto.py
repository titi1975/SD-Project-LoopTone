from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic.alias_generators import to_camel

from modules.user.utils.validators import is_strong_password


class UserCreateDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    nome: str = Field(..., min_length=2, max_length=20, pattern=r"^[a-zA-ZÀ-ÿ0-9 ]+$")
    email: EmailStr
    senha: str = Field(..., min_length=8)

    @field_validator("nome")
    @classmethod
    def prevent_double_spaces(cls, v: str) -> str:
        if "  " in v:
            raise ValueError("Não pode conter espaços seguidos.")
        return v

    @field_validator("senha")
    @classmethod
    def validate_password_logic(cls, v: str) -> str:
        if not is_strong_password(v):
            raise ValueError("Senha fraca. Use maiúscula, minúscula, número e caractere especial.")
        return v
