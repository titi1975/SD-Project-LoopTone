from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel
from typing import List, Optional

from modules.equipment.entities.enums import InstrumentTypeEnum
from modules.equipment.utils.validators import validate_text_rules

# Importamos os sub-modelos do CreateDTO para reaproveitar as validações de marca e modelo
from modules.equipment.dtos.equipment_create_dto import InstrumentDTO, AmpDTO

class EquipmentUpdateDTO(BaseModel):
    """
    Contrato de entrada para a atualização de equipamentos.
    Todos os campos são opcionais (Optional) para permitir atualizações parciais.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    # Note que o user_id não está aqui. Por segurança, o usuário a quem pertence
    # o equipamento não deve ser alterado após a criação.
    
    profile_name: Optional[str] = Field(None, max_length=50)
    instrument_type: Optional[str] = Field(None) 
    
    instrument: Optional[InstrumentDTO] = None
    amps: Optional[List[AmpDTO]] = Field(None, max_length=10)
    pedals: Optional[List[str]] = Field(None, max_length=10)
    daws: Optional[List[str]] = Field(None, max_length=5)

    @field_validator('profile_name', mode='before')
    @classmethod
    def validate_profile_name(cls, v):
        if v is None:
            return v
        return validate_text_rules(v)

    @field_validator('instrument_type', mode='before')
    @classmethod
    def validate_instrument_type(cls, v):
        if v is None:
            return v
            
        v = validate_text_rules(v)
        valid_options = [e.value for e in InstrumentTypeEnum]
        if v not in valid_options:
            raise ValueError("O sistema aceita apenas Guitarra, Baixo ou Violão")
        return v

    @field_validator('pedals')
    @classmethod
    def validate_pedals(cls, v: Optional[List[str]]):
        if v is None:
            return v
            
        if not v:
            raise ValueError("A lista de pedais não pode ser vazia.")
            
        return [validate_text_rules(item) for item in v if len(item) <= 50]

    @field_validator('daws')
    @classmethod
    def validate_daws(cls, v: Optional[List[str]]):
        if v is None:
            return v
            
        return [validate_text_rules(item) for item in v if len(item) <= 50]