from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from modules.user.dtos.user_response_dto import UserResponseDTO


class AuthResponseDTO(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    access_token: str
    token_type: str = "bearer"
    user: UserResponseDTO