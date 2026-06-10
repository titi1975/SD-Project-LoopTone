from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import List, Optional

class ToneAnalysisRequestDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    equipment_id: int = Field(..., description="O ID do setup que o usuário quer usar como base")
    target_artist: str = Field(..., max_length=100)
    target_song: str = Field(..., max_length=100)
    target_instrument: str = Field(..., max_length=50)
    current_tone_simulation: Optional[str] = Field(
        None,
        description="Opcional. Descrição textual complementar do som atual. Ex: 'Meu som está muito abafado e com pouco ganho'"
    )

class ToneAnalysisResponseDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    analysis_summary: str = Field(..., description="Breve análise técnica do timbre alvo.")
    adjustments: List[str] = Field(..., description="Passo a passo de como configurar os amps e pedais existentes.")
    missing_elements: List[str] = Field(..., description="O que falta no setup e sugestões do que adquirir ou usar no DAW.")
