from typing import Optional, List
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from infra.database.database_config import get_db
from modules.tone_analysis.dtos.tone_analysis_dto import ToneAnalysisRequestDTO, ToneAnalysisResponseDTO, SavedToneResponseDTO
from modules.tone_analysis.services.gemini_service import GeminiService
from modules.tone_analysis.services.librosa_audio_service import LibrosaAudioService
from modules.tone_analysis.utils.audio_storage import save_audio_file
from modules.equipment.repositories.equipment_repository import EquipmentRepository
from modules.tone_analysis.repositories.tone_repository import ToneRepository
from shared.security.dependencies import get_current_user_id
from shared.documentation.api_docs import TONE_ANALYSIS_DOCS

from modules.tone_analysis.use_cases.generate_feedback import GenerateToneFeedbackUseCase
from modules.tone_analysis.use_cases.delete_tone import DeleteToneUseCase
from modules.tone_analysis.use_cases.get_equipment_tones import GetEquipmentTonesUseCase
from modules.tone_analysis.use_cases.update_tone_feedback import UpdateToneFeedbackUseCase

router = APIRouter(prefix="/api/analysis", tags=["AI Tone Analysis"])

def get_equipment_repository(db: Session = Depends(get_db)) -> EquipmentRepository:
    return EquipmentRepository(db)

def get_llm_provider() -> GeminiService:
    return GeminiService()

def get_audio_analyzer() -> LibrosaAudioService:
    return LibrosaAudioService()

def get_tone_repository(db: Session = Depends(get_db)) -> ToneRepository:
    return ToneRepository(db)

@router.post(
    "/feedback",
    response_model=ToneAnalysisResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Gerar Feedback e Análise Espectral de Timbre",
    description=TONE_ANALYSIS_DOCS["feedback"]
)
def generate_feedback(
    equipment_id: int = Form(..., description="ID do setup base"),
    nome_personalizado: Optional[str] = Form(None, max_length=100, description="Nome identificador amigável"),
    target_artist: Optional[str] = Form(None, max_length=100),
    target_song: Optional[str] = Form(None, max_length=100),
    target_instrument: Optional[str] = Form(None, max_length=50),
    current_tone_simulation: Optional[str] = Form(None),
    setup_audio: Optional[UploadFile] = File(None, description="Áudio do timbre atual do seu setup"),
    target_audio: Optional[UploadFile] = File(None, description="Áudio MP3/WAV do artista que deseja copiar"),
    current_user_id: int = Depends(get_current_user_id),
    repo: EquipmentRepository = Depends(get_equipment_repository),
    llm: GeminiService = Depends(get_llm_provider),
    analyzer: LibrosaAudioService = Depends(get_audio_analyzer),
    tone_repo: ToneRepository = Depends(get_tone_repository)
):
    setup_file_data = {"path": None, "bytes": None, "mime": None}
    target_file_data = {"path": None, "bytes": None, "mime": None}

    if setup_audio:
        path, b_bytes, mime = save_audio_file(setup_audio)
        setup_file_data.update({"path": path, "bytes": b_bytes, "mime": mime})
        
    if target_audio:
        path, b_bytes, mime = save_audio_file(target_audio)
        target_file_data.update({"path": path, "bytes": b_bytes, "mime": mime})

    data = ToneAnalysisRequestDTO(
        equipment_id=equipment_id,
        nome_personalizado=nome_personalizado,
        target_artist=target_artist,
        target_song=target_song,
        target_instrument=target_instrument,
        current_tone_simulation=current_tone_simulation,
    )

    use_case = GenerateToneFeedbackUseCase(repo, llm, analyzer, tone_repo)
    
    return use_case.execute(
        current_user_id,
        data,
        setup_audio_path=str(setup_file_data["path"]) if setup_file_data["path"] else None,
        setup_audio_bytes=setup_file_data["bytes"],
        setup_audio_mime=setup_file_data["mime"],
        target_audio_path=str(target_file_data["path"]) if target_file_data["path"] else None,
        target_audio_bytes=target_file_data["bytes"],
        target_audio_mime=target_file_data["mime"]
    )

@router.delete(
    "/tones/{tone_id}",
    status_code=status.HTTP_200_OK,
    summary="Deletar um Timbre do Laboratório",
    description=TONE_ANALYSIS_DOCS.get("delete", "")
)
def delete_tone(
    tone_id: int,
    current_user_id: int = Depends(get_current_user_id),
    tone_repo: ToneRepository = Depends(get_tone_repository)
):
    use_case = DeleteToneUseCase(tone_repo)
    use_case.execute(current_user_id, tone_id)
    return {"message": "Timbre removido com sucesso de seu laboratório."}

@router.get(
    "/equipments/{equipment_id}/tones",
    response_model=List[SavedToneResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Listar Timbres Salvos de um Setup",
    description="Retorna o histórico de todas as sessões de laboratório."
)
def get_equipment_tones(
    equipment_id: int,
    current_user_id: int = Depends(get_current_user_id),
    repo: EquipmentRepository = Depends(get_equipment_repository),
    tone_repo: ToneRepository = Depends(get_tone_repository)
):
    use_case = GetEquipmentTonesUseCase(repo, tone_repo)
    return use_case.execute(current_user_id, equipment_id)

@router.put(
    "/tones/{tone_id}",
    response_model=ToneAnalysisResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Refinar um Timbre Existente",
    description=TONE_ANALYSIS_DOCS.get("update", "")
)
def update_tone_feedback(
    tone_id: int,
    nome_personalizado: Optional[str] = Form(None, max_length=100),
    target_artist: Optional[str] = Form(None),
    target_song: Optional[str] = Form(None),
    target_instrument: Optional[str] = Form(None),
    current_tone_simulation: Optional[str] = Form(None),
    setup_audio: Optional[UploadFile] = File(None),
    target_audio: Optional[UploadFile] = File(None),
    current_user_id: int = Depends(get_current_user_id),
    llm: GeminiService = Depends(get_llm_provider),
    analyzer: LibrosaAudioService = Depends(get_audio_analyzer),
    tone_repo: ToneRepository = Depends(get_tone_repository)
):
    setup_file_data = {"path": None, "bytes": None, "mime": None}
    target_file_data = {"path": None, "bytes": None, "mime": None}

    if setup_audio:
        path, b_bytes, mime = save_audio_file(setup_audio)
        setup_file_data.update({"path": path, "bytes": b_bytes, "mime": mime})
        
    if target_audio:
        path, b_bytes, mime = save_audio_file(target_audio)
        target_file_data.update({"path": path, "bytes": b_bytes, "mime": mime})

    use_case = UpdateToneFeedbackUseCase(llm, analyzer, tone_repo)
    
    return use_case.execute(
        user_id=current_user_id,
        tone_id=tone_id,
        nome_personalizado=nome_personalizado,
        target_artist=target_artist,
        target_song=target_song,
        target_instrument=target_instrument,
        current_tone_simulation=current_tone_simulation,
        setup_audio_path=str(setup_file_data["path"]) if setup_file_data["path"] else None,
        setup_audio_bytes=setup_file_data["bytes"],
        setup_audio_mime=setup_file_data["mime"],
        target_audio_path=str(target_file_data["path"]) if target_file_data["path"] else None,
        target_audio_bytes=target_file_data["bytes"],
        target_audio_mime=target_file_data["mime"]
    )