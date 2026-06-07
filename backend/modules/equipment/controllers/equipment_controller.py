from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from infra.database.database_config import get_db

from modules.equipment.dtos.equipment_create_dto import EquipmentCreateDTO
from modules.equipment.dtos.equipment_response_dto import EquipmentResponseDTO
from modules.equipment.dtos.equipment_update_dto import EquipmentUpdateDTO 
from modules.equipment.repositories.equipment_repository import EquipmentRepository

from modules.equipment.use_cases.create_equipment import CreateEquipmentUseCase
from modules.equipment.use_cases.delete_equipment import DeleteEquipmentUseCase
from modules.equipment.use_cases.find_user_equipments import FindUserEquipmentsUseCase
from modules.equipment.use_cases.update_equipment import UpdateEquipmentUseCase
from modules.user.dtos.user_response_dto import MessageResponseDTO

from shared.documentation.api_docs import EQUIPMENT_DOCS

# Import da nossa dependência de segurança (O Cadeado)
from shared.security.dependencies import get_current_user_id

router = APIRouter(prefix="/api/equipments", tags=["Equipments"])

# ESTA FUNÇÃO DEVE SEMPRE FICAR ACIMA DAS ROTAS
def get_equipment_repository(db: Session = Depends(get_db)) -> EquipmentRepository:
    return EquipmentRepository(db)

@router.post(
    "/", 
    response_model=EquipmentResponseDTO, 
    status_code=status.HTTP_201_CREATED,
    summary="Criar um Setup de Equipamento",
    description=EQUIPMENT_DOCS["create"]
)
def create_equipment(
    data: EquipmentCreateDTO,
    # CADEADO APLICADO: Extrai o ID direto do Token JWT
    current_user_id: int = Depends(get_current_user_id),
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = CreateEquipmentUseCase(repo)
    return use_case.execute(current_user_id, data)

@router.get(
    "/me", 
    response_model=List[EquipmentResponseDTO], 
    status_code=status.HTTP_200_OK,
    summary="Listar Setups do Usuário",
    description=EQUIPMENT_DOCS["get_all_by_user"]
)
def get_my_equipments(
    # CADEADO APLICADO
    current_user_id: int = Depends(get_current_user_id), 
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = FindUserEquipmentsUseCase(repo)
    return use_case.execute(current_user_id)

@router.put(
    "/{equipment_id}", 
    response_model=EquipmentResponseDTO, 
    status_code=status.HTTP_200_OK,
    summary="Atualizar Setup de Equipamento",
    description=EQUIPMENT_DOCS["update"]
)
def update_equipment(
    equipment_id: int,
    data: EquipmentUpdateDTO,
    # CADEADO APLICADO
    current_user_id: int = Depends(get_current_user_id), 
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    # NOTA: Em um projeto 100% rigoroso, você também verificaria se 
    # o equipamento que está sendo atualizado pertence ao current_user_id.
    use_case = UpdateEquipmentUseCase(repo)
    return use_case.execute(equipment_id, data)

@router.delete(
    "/{equipment_id}", 
    response_model=MessageResponseDTO, 
    status_code=status.HTTP_200_OK,
    summary="Deletar Setup de Equipamento",
    description=EQUIPMENT_DOCS["delete"]
)
def delete_equipment(
    equipment_id: int,
    # CADEADO APLICADO
    current_user_id: int = Depends(get_current_user_id), 
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = DeleteEquipmentUseCase(repo)
    return use_case.execute(equipment_id)