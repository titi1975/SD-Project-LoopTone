from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional

class UserFilterDTO(BaseModel):
    """Agrupa os parâmetros de busca para o FindAll."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    
    skip: int = 0
    limit: int = 10
    nome: Optional[str] = None
    email: Optional[str] = None