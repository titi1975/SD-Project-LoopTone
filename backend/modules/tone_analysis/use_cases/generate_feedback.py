import os
from typing import Optional
from modules.tone_analysis.dtos.tone_analysis_dto import ToneAnalysisRequestDTO, ToneAnalysisResponseDTO
from modules.tone_analysis.services.interfaces import ILLMProvider, IAudioAnalyzer
from modules.equipment.repositories.interfaces import IEquipmentRepository
from modules.tone_analysis.repositories.tone_repository import ToneRepository
from modules.tone_analysis.entities.tone_entity import ToneEntity
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException

# --- IMPORT DO SERVIÇO DE CRÉDITOS ---
from modules.equipment.services.credit_service import CreditService

class GenerateToneFeedbackUseCase:
    def __init__(
        self, 
        equipment_repo: IEquipmentRepository, 
        llm_provider: ILLMProvider,
        audio_analyzer: IAudioAnalyzer,
        tone_repo: ToneRepository 
    ):
        self.equipment_repo = equipment_repo
        self.llm_provider = llm_provider
        self.audio_analyzer = audio_analyzer
        self.tone_repo = tone_repo
        # --- INICIA O SERVIÇO ---
        self.credit_service = CreditService(equipment_repo)

    def execute(
        self,
        user_id: int,
        dto: ToneAnalysisRequestDTO,
        setup_audio_path: Optional[str] = None,
        setup_audio_bytes: Optional[bytes] = None,
        setup_audio_mime: Optional[str] = None,
        target_audio_path: Optional[str] = None,
        target_audio_bytes: Optional[bytes] = None,
        target_audio_mime: Optional[str] = None,
    ) -> ToneAnalysisResponseDTO:
        
        # Trava 1: Limite de Slots
        if self.tone_repo.count_by_equipment(dto.equipment_id) >= 3:
            self._cleanup_files([setup_audio_path, target_audio_path])
            raise BusinessRuleException("Limite máximo atingido. Cada setup pode possuir no máximo 3 Timbres.")

        # Trava 2: Posse do Equipamento
        equipment = self.equipment_repo.get_by_id(dto.equipment_id)
        if not equipment or equipment.user_id != user_id:
            self._cleanup_files([setup_audio_path, target_audio_path])
            raise NotFoundException("Setup não encontrado.")

        # --- TRAVA 3: O PEDÁGIO DIÁRIO ---
        # Tenta consumir. Se não tiver crédito, ele lança a exceção e barra tudo aqui.
        try:
            self.credit_service.consume_credit_or_fail(equipment)
        except BusinessRuleException as e:
            self._cleanup_files([setup_audio_path, target_audio_path])
            raise e # Relança a exceção do tempo restante para o Controller
            
        # ... TODO O RESTO DO SEU CÓDIGO PERMANECE EXATAMENTE IGUAL ...
        amps_str = ", ".join([f"{amp['brand']} {amp['model']}" for amp in equipment.amps]) if equipment.amps else "Nenhum"
        pedals_str = ", ".join(equipment.pedals) if equipment.pedals else "Nenhum"

        setup_spectral_context = ""
        system_warnings = []
        if setup_audio_path:
            analysis_data = self.audio_analyzer.analyze_audio(setup_audio_path)
            system_warnings.extend(analysis_data["audio_quality"]["warnings"])
            m = analysis_data["tone_signature"]
            setup_spectral_context = f"DADOS DO SETUP: Centroid={m['centroid']:.2f}, Flatness={m['flatness']:.4f}"

        target_spectral_context = ""
        if target_audio_path:
            analysis_data_target = self.audio_analyzer.analyze_audio(target_audio_path)
            mt = analysis_data_target["tone_signature"]
            target_spectral_context = f"DADOS DA REFERÊNCIA: Centroid={mt['centroid']:.2f}, Flatness={mt['flatness']:.4f}"

        self._cleanup_files([setup_audio_path, target_audio_path])

        if dto.target_artist and dto.target_song:
            goal_text = f"Alcance o timbre de {dto.target_artist} na música '{dto.target_song}'."
        elif target_audio_path:
            goal_text = "Alcance o timbre exato do áudio de referência enviado."
        else:
            goal_text = "Sugira texturas experimentais livres para o setup."

        prompt = f"OBJETIVO: {goal_text}\nAMPS: {amps_str}\nPEDAIS: {pedals_str}\n{setup_spectral_context}\n{target_spectral_context}\nNotas: {dto.current_tone_simulation or ''}"

        ai_data = self.llm_provider.generate_tone_feedback(
            prompt, setup_audio_bytes, setup_audio_mime, target_audio_bytes, target_audio_mime
        )

        nome_final = dto.nome_personalizado
        if not nome_final:
            if dto.target_artist and dto.target_song:
                nome_final = f"Timbre - {dto.target_song}"
            else:
                nome_final = f"Experimento {self.tone_repo.count_by_equipment(dto.equipment_id) + 1}"

        tone_entity = ToneEntity(
            equipment_id=dto.equipment_id,
            nome_personalizado=nome_final, 
            target_artist=dto.target_artist,
            target_song=dto.target_song,
            analysis_summary=ai_data.get("analysis_summary", ""),
            adjustments=ai_data.get("adjustments", []),
            missing_elements=ai_data.get("missing_elements", [])
        )
        self.tone_repo.create(tone_entity)

        return ToneAnalysisResponseDTO(
            analysis_summary=ai_data.get("analysis_summary", ""),
            adjustments=ai_data.get("adjustments", []),
            missing_elements=ai_data.get("missing_elements", []),
            warnings=system_warnings 
        )

    def _cleanup_files(self, paths: list[Optional[str]]):
        for path in paths:
            if path:
                try: os.remove(path)
                except OSError: pass