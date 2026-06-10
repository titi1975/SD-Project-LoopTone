import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from shared.exceptions.base_exceptions import BusinessRuleException

# Onde os áudios ficam salvos. Configurável por variável de ambiente.
UPLOAD_DIR = Path(os.getenv("AUDIO_UPLOAD_DIR", "uploads/audio"))

# Limite de 15 MB — suficiente para um trecho de guitarra, evita abuso.
MAX_FILE_SIZE = 15 * 1024 * 1024

# Tipos de áudio aceitos pelo Gemini (e seguros de receber).
ALLOWED_CONTENT_TYPES = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/wave": ".wav",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/aac": ".aac",
    "audio/webm": ".webm",
}


def save_audio_file(file: UploadFile) -> tuple[Path, bytes, str]:
    """
    Valida o áudio enviado, salva em disco e devolve:
    (caminho_salvo, bytes_do_audio, mime_type).

    Levanta BusinessRuleException em qualquer falha de validação.
    """
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise BusinessRuleException(
            f"Formato de áudio não suportado: '{content_type or 'desconhecido'}'. "
            f"Use mp3, wav, ogg, flac, m4a, aac ou webm."
        )

    # Lê o conteúdo (FastAPI mantém em memória/spool). Checa tamanho real.
    content = file.file.read()
    size = len(content)

    if size == 0:
        raise BusinessRuleException("O arquivo de áudio está vazio.")
    if size > MAX_FILE_SIZE:
        raise BusinessRuleException(
            f"Áudio muito grande ({size / 1024 / 1024:.1f} MB). "
            f"O limite é {MAX_FILE_SIZE // (1024 * 1024)} MB."
        )

    # Garante que a pasta de destino existe.
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = ALLOWED_CONTENT_TYPES[content_type]
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename

    with open(destination, "wb") as buffer:
        buffer.write(content)

    return destination, content, content_type
