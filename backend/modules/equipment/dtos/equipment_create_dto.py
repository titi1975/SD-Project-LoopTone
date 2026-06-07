from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel
from typing import List, Optional
from modules.equipment.entities.enums import InstrumentTypeEnum
from modules.equipment.utils.validators import validate_text_rules

class InstrumentDTO(BaseModel):
    brand: str = Field(..., max_length=20)
    model: str = Field(..., max_length=20)

    @field_validator('brand', 'model', mode='before')
    @classmethod
    def apply_text_rules(cls, v):
        return validate_text_rules(v)

class AmpDTO(BaseModel):
    brand: str = Field(..., max_length=50)
    model: str = Field(..., max_length=50)

    @field_validator('brand', 'model', mode='before')
    @classmethod
    def apply_text_rules(cls, v):
        return validate_text_rules(v)

class EquipmentCreateDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    
    profile_name: str = Field(..., max_length=50)
    instrument_type: str = Field(...) 
    
    instrument: InstrumentDTO 
    amps: List[AmpDTO] = Field(..., max_length=10) 
    pedals: List[str] = Field(..., max_length=10)  
    daws: Optional[List[str]] = Field(None, max_length=5) 

    @field_validator('profile_name', mode='before')
    @classmethod
    def validate_profile_name(cls, v):
        return validate_text_rules(v)

    @field_validator('instrument_type', mode='before')
    @classmethod
    def validate_instrument_type(cls, v):
        v = validate_text_rules(v)
        valid_options = [e.value for e in InstrumentTypeEnum]
        if v not in valid_options:
            raise ValueError("O sistema aceita apenas Guitarra, Baixo ou Violão")
        return v

    @field_validator('pedals', 'daws')
    @classmethod
    def validate_lists(cls, v: Optional[List[str]]):
        if v is None:
            return v
        if not v and cls.__name__ == 'pedals':
            raise ValueError("A lista de pedais não pode ser vazia.")
        
        return [validate_text_rules(item) for item in v if len(item) <= 50]