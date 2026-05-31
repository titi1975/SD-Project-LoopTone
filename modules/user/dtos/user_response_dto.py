from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class UserResponseDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)
    
    id: int
    nome: str
    sobrenome: str
    idade: int
    email: str
    ativo: bool

class MessageResponseDTO(BaseModel):
    """Usado para retornos genéricos, como sucesso ao deletar."""
    message: str