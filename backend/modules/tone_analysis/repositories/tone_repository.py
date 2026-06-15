from sqlalchemy.orm import Session
from typing import Optional
from modules.tone_analysis.entities.tone_entity import ToneEntity

class ToneRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_by_equipment(self, equipment_id: int) -> int:
        return self.db.query(ToneEntity).filter(ToneEntity.equipment_id == equipment_id).count()

    def create(self, entity: ToneEntity) -> ToneEntity:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    # ---------------------------------------------------------
    # NOVOS MÉTODOS DE DELEÇÃO
    # ---------------------------------------------------------
    def get_by_id(self, tone_id: int) -> Optional[ToneEntity]:
        """Busca um timbre específico pelo seu identificador único."""
        return self.db.query(ToneEntity).filter(ToneEntity.id == tone_id).first()

    def delete(self, tone_id: int) -> None:
        """Remove o registro do timbre fisicamente do banco de dados."""
        tone = self.get_by_id(tone_id)
        if tone:
            self.db.delete(tone)
            self.db.commit()

    def get_all_by_equipment(self, equipment_id: int) -> list[ToneEntity]:
        """Busca o histórico completo de timbres de um setup, do mais novo pro mais velho."""
        return self.db.query(ToneEntity)\
            .filter(ToneEntity.equipment_id == equipment_id)\
            .order_by(ToneEntity.created_at.desc())\
            .all()
    
    def update(self, entity: ToneEntity) -> ToneEntity:
        """Salva as alterações feitas em um timbre existente no banco de dados."""
        self.db.commit()
        self.db.refresh(entity)
        return entity