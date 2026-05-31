from pydantic import BaseModel, EmailStr, Field


class AuthLoginDTO(BaseModel):
    email: EmailStr
    senha: str = Field(..., min_length=8)
