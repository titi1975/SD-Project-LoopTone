import os
from openai import OpenAI
from modules.tone_analysis.services.interfaces import ILLMProvider
from shared.exceptions.base_exceptions import BusinessRuleException

class OpenAIService(ILLMProvider):
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise BusinessRuleException("Chave da API da OpenAI não configurada no servidor.")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o" # Ou gpt-3.5-turbo para economizar durante os testes

    def generate_tone_feedback(self, prompt_text: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=0.7, # 0.7 dá um bom balanço entre precisão técnica e criatividade
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um engenheiro de áudio especialista em timbres de guitarra, baixo e produção musical."
                    },
                    {
                        "role": "user",
                        "content": prompt_text
                    }
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            # Captura erros da API (falta de créditos, timeout) e devolve amigavelmente
            raise BusinessRuleException(f"Erro ao consultar a Inteligência Artificial: {str(e)}")