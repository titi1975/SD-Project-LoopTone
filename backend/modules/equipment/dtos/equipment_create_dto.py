from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class EquipmentCreateDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strip_whitespace=True)

    user_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=2, max_length=80)
    category: str = Field(..., min_length=2, max_length=40)
