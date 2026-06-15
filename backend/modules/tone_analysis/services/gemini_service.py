import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

from google import genai
from google.genai import types

from modules.tone_analysis.services.interfaces import ILLMProvider
from shared.exceptions.base_exceptions import BusinessRuleException

load_dotenv()

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
        
        self.config = types.GenerateContentConfig(
            system_instruction="Você é um engenheiro de áudio especialista em timbres de guitarra, baixo e produção musical. Seja direto e prático. Baseie-se fortemente nos dados espectrais fornecidos.",
            temperature=0.7,
            response_mime_type="application/json", 
            response_schema=AIToneResponseSchema   
        )

    def generate_tone_feedback(
        self,
        prompt_text: str,
        setup_audio_bytes: Optional[bytes] = None,
        setup_audio_mime: Optional[str] = None,
        target_audio_bytes: Optional[bytes] = None,
        target_audio_mime: Optional[str] = None,
    ) -> dict:
        try:
            # A lista contents é a nossa "linha do tempo" do prompt
            contents = [prompt_text]
            
            # Se o usuário enviou o som do setup, adicionamos na requisição
            if setup_audio_bytes and setup_audio_mime:
                contents.append("\n[ÁUDIO 1 EM ANEXO: Som atual do usuário]")
                contents.append(
                    types.Part.from_bytes(data=setup_audio_bytes, mime_type=setup_audio_mime)
                )

            # Se o usuário enviou o som de referência, adicionamos também
            if target_audio_bytes and target_audio_mime:
                contents.append("\n[ÁUDIO 2 EM ANEXO: Som de referência / alvo]")
                contents.append(
                    types.Part.from_bytes(data=target_audio_bytes, mime_type=target_audio_mime)
                )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=self.config
            )
            
            return json.loads(response.text)
            
        except Exception as e:
            raise BusinessRuleException(f"Erro ao consultar a Inteligência Artificial (Gemini): {str(e)}")