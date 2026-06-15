from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pydantic.alias_generators import to_camel

class VerifyEmailDTO(BaseModel):
    # Transforma "verification_code" em "verificationCode" no JSON do Front-end
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    email: EmailStr
    # O código de verificação terá exatamente 6 caracteres
    code: str = Field(..., min_length=6, max_length=6, description="Código de 6 dígitos enviado por e-mail")

class ForgotPasswordDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    email: EmailStr = Field(..., description="E-mail do usuário que esqueceu a senha")

class ResetPasswordDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    email: EmailStr
    reset_token: str = Field(..., description="Token longo enviado no e-mail")
    # Força a nova senha a ter pelo menos 8 caracteres, assim como você fez no Login
    nova_senha: str = Field(..., min_length=8, description="A nova senha desejada")