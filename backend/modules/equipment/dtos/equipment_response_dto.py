from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Optional

class EquipmentResponseDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

    id: int
    user_id: int
    profile_name: str
    instrument_type: str
    instrument: dict 
    amps: List[dict] # Corrigido para plural (lista de dicionários)
    pedals: List[str]
    daws: Optional[List[str]] = None # Corrigido para plural (lista de strings)