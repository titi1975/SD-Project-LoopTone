from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class UserUpdateDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    nome: Optional[str] = Field(None, min_length=2, max_length=20, pattern=r"^[a-zA-ZÀ-ÿ0-9 ]+$")
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=8)
