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

router = APIRouter(prefix="/api/equipments", tags=["Equipments"])


def get_equipment_repository(db: Session = Depends(get_db)) -> EquipmentRepository:
    return EquipmentRepository(db)


@router.post("/", response_model=EquipmentResponseDTO, status_code=status.HTTP_201_CREATED)
def create_equipment(
    data: EquipmentCreateDTO,
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = CreateEquipmentUseCase(repo)
    return use_case.execute(data)


@router.get("/", response_model=List[EquipmentResponseDTO], status_code=status.HTTP_200_OK)
def get_user_equipments(
    user_id: int,
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = FindUserEquipmentsUseCase(repo)
    return use_case.execute(user_id)


@router.put("/{equipment_id}", response_model=EquipmentResponseDTO, status_code=status.HTTP_200_OK)
def update_equipment(
    equipment_id: int,
    data: EquipmentUpdateDTO,
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = UpdateEquipmentUseCase(repo)
    return use_case.execute(equipment_id, data)


@router.delete("/{equipment_id}", response_model=MessageResponseDTO, status_code=status.HTTP_200_OK)
def delete_equipment(
    equipment_id: int,
    repo: EquipmentRepository = Depends(get_equipment_repository),
):
    use_case = DeleteEquipmentUseCase(repo)
    return use_case.execute(equipment_id)
