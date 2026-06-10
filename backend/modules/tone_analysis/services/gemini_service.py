import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel

from google import genai
from google.genai import types

from modules.tone_analysis.services.interfaces import ILLMProvider
from shared.exceptions.base_exceptions import BusinessRuleException

load_dotenv()

# Molde interno para forçar o Gemini a cuspir o JSON estruturado
class AIToneResponseSchema(BaseModel):
    analysis_summary: str
    adjustments: list[str]
    missing_elements: list[str]

class GeminiService(ILLMProvider):
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise BusinessRuleException("Chave da API do Gemini não configurada no servidor (.env).")
        
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.5-flash' 
        
        # Injetando o Molde (Schema) nas configurações da IA
        self.config = types.GenerateContentConfig(
            system_instruction="Você é um engenheiro de áudio especialista em timbres de guitarra, baixo e produção musical. Seja direto e prático.",
            temperature=0.7,
            response_mime_type="application/json", # Exige que a saída seja JSON
            response_schema=AIToneResponseSchema   # Usa o nosso molde estrutural
        )

    def generate_tone_feedback(
        self,
        prompt_text: str,
        audio_bytes: bytes | None = None,
        audio_mime_type: str | None = None,
    ) -> dict:
        try:
            # Monta o conteúdo: o prompt de texto sempre vai;
            # se houver áudio, ele entra como uma "part" multimodal.
            contents = [prompt_text]
            if audio_bytes and audio_mime_type:
                contents.append(
                    types.Part.from_bytes(
                        data=audio_bytes,
                        mime_type=audio_mime_type,
                    )
                )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=self.config
            )
            
            # Como exigimos JSON, a resposta é convertida com segurança para dicionário
            return json.loads(response.text)
            
        except Exception as e:
            raise BusinessRuleException(f"Erro ao consultar a Inteligência Artificial (Gemini): {str(e)}")
