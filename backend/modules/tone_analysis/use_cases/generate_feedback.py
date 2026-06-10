from typing import Optional

from modules.tone_analysis.dtos.tone_analysis_dto import ToneAnalysisRequestDTO, ToneAnalysisResponseDTO
from modules.tone_analysis.services.interfaces import ILLMProvider
from modules.equipment.repositories.interfaces import IEquipmentRepository
from shared.exceptions.base_exceptions import NotFoundException

class GenerateToneFeedbackUseCase:
    def __init__(self, equipment_repo: IEquipmentRepository, llm_provider: ILLMProvider):
        self.equipment_repo = equipment_repo
        self.llm_provider = llm_provider

    def execute(
        self,
        user_id: int,
        dto: ToneAnalysisRequestDTO,
        audio_bytes: Optional[bytes] = None,
        audio_mime_type: Optional[str] = None,
    ) -> ToneAnalysisResponseDTO:
        equipment = self.equipment_repo.get_by_id(dto.equipment_id)
        if not equipment or equipment.user_id != user_id:
            raise NotFoundException("Setup de equipamento não encontrado ou não pertence a você.")

        amps_str = ", ".join([f"{amp['brand']} {amp['model']}" for amp in equipment.amps]) if equipment.amps else "Nenhum amp cadastrado"
        pedals_str = ", ".join(equipment.pedals) if equipment.pedals else "Nenhum pedal"

        # O áudio é a fonte principal de análise. O texto é complemento opcional.
        if audio_bytes:
            audio_instruction = (
                "Ouça o ÁUDIO em anexo, que é o som atual do usuário. "
                "Analise tecnicamente o timbre (ganho, equalização, brilho, graves, "
                "saturação, efeitos perceptíveis) a partir do que você ouve."
            )
        else:
            audio_instruction = "Nenhum áudio foi enviado; baseie-se apenas na descrição textual."

        extra_note = ""
        if dto.current_tone_simulation:
            extra_note = f'\n        Observação textual adicional do usuário sobre o som atual:\n        "{dto.current_tone_simulation}"\n'

        prompt = f"""
        O usuário deseja reproduzir o seguinte timbre:
        Artista: {dto.target_artist}
        Música: {dto.target_song}
        Instrumento: {dto.target_instrument}

        {audio_instruction}
        {extra_note}
        O EQUIPAMENTO REAL que o usuário possui é:
        - Amplificadores: {amps_str}
        - Pedais: {pedals_str}

        Forneça os passos para ele se aproximar desse tom considerando APENAS o equipamento que ele tem. Se faltar algo crítico, aponte.
        """

        # O ai_data agora é um dicionário estruturado
        ai_data = self.llm_provider.generate_tone_feedback(
            prompt,
            audio_bytes=audio_bytes,
            audio_mime_type=audio_mime_type,
        )

        return ToneAnalysisResponseDTO(
            analysis_summary=ai_data.get("analysis_summary", ""),
            adjustments=ai_data.get("adjustments", []),
            missing_elements=ai_data.get("missing_elements", [])
        )
