from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import List, Optional
from datetime import datetime

class ToneAnalysisRequestDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    equipment_id: int = Field(..., description="ID do setup base")
    nome_personalizado: Optional[str] = Field(None, max_length=100, description="Nome identificador amigável")
    
    # Tornamos os alvos opcionais para permitir o modo "Exploração Livre"
    target_artist: Optional[str] = Field(None, max_length=100)
    target_song: Optional[str] = Field(None, max_length=100)
    target_instrument: Optional[str] = Field(None, max_length=50)
    
    current_tone_simulation: Optional[str] = Field(
        None, description="Descrição textual de como o usuário se sente em relação ao som atual"
    )

class ToneAnalysisResponseDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    analysis_summary: str = Field(..., description="Análise técnica do timbre.")
    adjustments: List[str] = Field(..., description="Passo a passo de configuração do hardware real.")
    missing_elements: List[str] = Field(..., description="Sugestões de plugins ou equipamentos faltantes.")
    warnings: List[str] = Field(default=[], description="Avisos sobre a qualidade da gravação enviada.")

class SavedToneResponseDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

    id: int
    equipment_id: int
    nome_personalizado: str
    target_artist: Optional[str]
    target_song: Optional[str]
    analysis_summary: str
    adjustments: List[str]
    missing_elements: List[str]
    created_at: datetime