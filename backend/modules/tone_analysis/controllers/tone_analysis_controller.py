from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from infra.database.database_config import get_db
from modules.tone_analysis.dtos.tone_analysis_dto import ToneAnalysisRequestDTO, ToneAnalysisResponseDTO
from modules.tone_analysis.services.gemini_service import GeminiService
from modules.tone_analysis.use_cases.generate_feedback import GenerateToneFeedbackUseCase
from modules.tone_analysis.utils.audio_storage import save_audio_file
from modules.equipment.repositories.equipment_repository import EquipmentRepository
from shared.security.dependencies import get_current_user_id

from shared.documentation.api_docs import TONE_ANALYSIS_DOCS

router = APIRouter(prefix="/api/analysis", tags=["AI Tone Analysis"])

def get_equipment_repository(db: Session = Depends(get_db)) -> EquipmentRepository:
    return EquipmentRepository(db)

def get_llm_provider() -> GeminiService:
    return GeminiService()

@router.post(
    "/feedback",
    response_model=ToneAnalysisResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Gerar Feedback de Timbre com IA (Gemini) a partir de um áudio",
    description=TONE_ANALYSIS_DOCS["feedback"]
)
def generate_feedback(
    # Campos enviados como multipart/form-data (junto do arquivo)
    equipment_id: int = Form(..., description="ID do setup base"),
    target_artist: str = Form(..., max_length=100),
    target_song: str = Form(..., max_length=100),
    target_instrument: str = Form(..., max_length=50),
    audio: UploadFile = File(..., description="Áudio do timbre atual do usuário (obrigatório)"),
    current_tone_simulation: Optional[str] = Form(
        None, description="Opcional: descrição textual complementar do som atual"
    ),
    current_user_id: int = Depends(get_current_user_id),
    repo: EquipmentRepository = Depends(get_equipment_repository),
    llm: GeminiService = Depends(get_llm_provider)
):
    # 1. Valida e salva o áudio em disco; recebe também os bytes p/ enviar à IA.
    _saved_path, audio_bytes, audio_mime = save_audio_file(audio)

    # 2. Monta o DTO com os campos de texto.
    data = ToneAnalysisRequestDTO(
        equipment_id=equipment_id,
        target_artist=target_artist,
        target_song=target_song,
        target_instrument=target_instrument,
        current_tone_simulation=current_tone_simulation,
    )

    # 3. Executa a análise passando o áudio para o LLM multimodal.
    use_case = GenerateToneFeedbackUseCase(repo, llm)
    return use_case.execute(
        current_user_id,
        data,
        audio_bytes=audio_bytes,
        audio_mime_type=audio_mime,
    )
