from pydantic import BaseModel, Field, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional

class UserUpdateDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    nome: Optional[str] = Field(None, min_length=2, max_length=20, pattern=r'^[a-zA-ZÀ-ÿ0-9 ]+$')
    sobrenome: Optional[str] = Field(None, min_length=2, max_length=50, pattern=r'^[a-zA-ZÀ-ÿ0-9 ]+$')
    idade: Optional[int] = Field(None, gt=0, lt=150)
    cep: Optional[str] = Field(None, pattern=r'^\d{8}$')
    endereco: Optional[str] = Field(None, min_length=4, max_length=50, pattern=r'^[a-zA-ZÀ-ÿ0-9 \-\,]+$')
    numero_residencia: Optional[int] = Field(None, gt=0, le=10000)
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=8)