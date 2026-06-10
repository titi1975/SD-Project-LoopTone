from abc import ABC, abstractmethod
from typing import Optional


class ILLMProvider(ABC):
    @abstractmethod
    def generate_tone_feedback(
        self,
        prompt_text: str,
        audio_bytes: Optional[bytes] = None,
        audio_mime_type: Optional[str] = None,
    ) -> dict:
        """
        Envia um prompt estruturado (e opcionalmente um áudio) para o LLM
        e retorna a resposta em formato de dicionário.
        """
        pass
