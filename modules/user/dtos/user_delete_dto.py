from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class UserDeleteResponseDTO(BaseModel):
    """
    Contrato de saída para confirmar a exclusão.
    (Nota: A entrada do delete é apenas o ID na URL, não exige um DTO de Request).
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    
    mensagem: str
    sucesso: bool = True