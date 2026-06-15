import os
from typing import Optional
from modules.tone_analysis.dtos.tone_analysis_dto import ToneAnalysisResponseDTO
from modules.tone_analysis.services.interfaces import ILLMProvider, IAudioAnalyzer
from modules.tone_analysis.repositories.tone_repository import ToneRepository
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException

# --- IMPORT DO SERVIÇO DE CRÉDITOS ---
from modules.equipment.services.credit_service import CreditService
# --- IMPORT DO REPOSITÓRIO DE EQUIPAMENTOS ---
from modules.equipment.repositories.interfaces import IEquipmentRepository

class UpdateToneFeedbackUseCase:
    def __init__(
        self, 
        llm_provider: ILLMProvider,
        audio_analyzer: IAudioAnalyzer,
        tone_repo: ToneRepository,
        # Precisamos receber o repo de equipamentos para instanciar o serviço
        equipment_repo: IEquipmentRepository 
    ):
        self.llm_provider = llm_provider
        self.audio_analyzer = audio_analyzer
        self.tone_repo = tone_repo
        self.equipment_repo = equipment_repo
        self.credit_service = CreditService(equipment_repo)

    def execute(
        self,
        user_id: int,
        tone_id: int,
        nome_personalizado: Optional[str] = None,
        target_artist: Optional[str] = None,
        target_song: Optional[str] = None,
        target_instrument: Optional[str] = None,
        current_tone_simulation: Optional[str] = None,
        setup_audio_path: Optional[str] = None,
        setup_audio_bytes: Optional[bytes] = None,
        setup_audio_mime: Optional[str] = None,
        target_audio_path: Optional[str] = None,
        target_audio_bytes: Optional[bytes] = None,
        target_audio_mime: Optional[str] = None,
    ) -> ToneAnalysisResponseDTO:
        
        # 1. Busca e valida posse
        tone = self.tone_repo.get_by_id(tone_id)
        if not tone or tone.equipment.user_id != user_id:
            self._cleanup_files([setup_audio_path, target_audio_path])
            raise NotFoundException("Sessão de laboratório não encontrada.")

        equipment = tone.equipment

        # --- TRAVA 3: O PEDÁGIO DIÁRIO ---
        try:
            self.credit_service.consume_credit_or_fail(equipment)
        except BusinessRuleException as e:
            self._cleanup_files([setup_audio_path, target_audio_path])
            raise e

        # ... O RESTANTE PERMANECE IGUAL ...
        amps_str = ", ".join([f"{amp['brand']} {amp['model']}" for amp in equipment.amps]) if equipment.amps else "Nenhum"
        pedals_str = ", ".join(equipment.pedals) if equipment.pedals else "Nenhum"

        setup_spectral_context = ""
        system_warnings = []
        if setup_audio_path:
            analysis_data = self.audio_analyzer.analyze_audio(setup_audio_path)
            system_warnings.extend(analysis_data["audio_quality"]["warnings"])
            m = analysis_data["tone_signature"]
            setup_spectral_context = f"DADOS DO NOVO ÁUDIO: Centroid={m['centroid']:.2f}, Flatness={m['flatness']:.4f}"

        target_spectral_context = ""
        if target_audio_path:
            analysis_data_target = self.audio_analyzer.analyze_audio(target_audio_path)
            mt = analysis_data_target["tone_signature"]
            target_spectral_context = f"DADOS REFERÊNCIA ATUALIZADOS: Centroid={mt['centroid']:.2f}, Flatness={mt['flatness']:.4f}"

        self._cleanup_files([setup_audio_path, target_audio_path])

        artist_to_use = target_artist or tone.target_artist
        song_to_use = target_song or tone.target_song
        
        prompt = f"REFINAMENTO: Suas orientações anteriores foram aplicadas. Nova Obs: {current_tone_simulation or ''}"

        ai_data = self.llm_provider.generate_tone_feedback(
            prompt, setup_audio_bytes, setup_audio_mime, target_audio_bytes, target_audio_mime
        )

        if nome_personalizado:
            tone.nome_personalizado = nome_personalizado
            
        tone.target_artist = artist_to_use
        tone.target_song = song_to_use
        tone.analysis_summary = ai_data.get("analysis_summary", "")
        tone.adjustments = ai_data.get("adjustments", [])
        tone.missing_elements = ai_data.get("missing_elements", [])
        
        self.tone_repo.update(tone)

        return ToneAnalysisResponseDTO(
            analysis_summary=tone.analysis_summary,
            adjustments=tone.adjustments,
            missing_elements=tone.missing_elements,
            warnings=system_warnings 
        )

    def _cleanup_files(self, paths: list[Optional[str]]):
        for path in paths:
            if path:
                try: os.remove(path)
                except OSError: pass