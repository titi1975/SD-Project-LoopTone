from abc import ABC, abstractmethod
from typing import Optional, Dict

class ILLMProvider(ABC):
    @abstractmethod
    def generate_tone_feedback(
        self,
        prompt_text: str,
        setup_audio_bytes: Optional[bytes] = None,
        setup_audio_mime: Optional[str] = None,
        target_audio_bytes: Optional[bytes] = None,
        target_audio_mime: Optional[str] = None,
    ) -> dict:
        """Envia o prompt e até dois áudios (origem e alvo) para a IA."""
        pass

class IAudioAnalyzer(ABC):
    @abstractmethod
    def analyze_audio(self, file_path: str) -> Dict:
        pass