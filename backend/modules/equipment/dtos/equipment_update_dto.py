from pydantic import BaseModel, Field


class EquipmentUpdateDTO(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    category: str = Field(..., min_length=2, max_length=40)
