from sqlalchemy.orm import Session
from typing import List, Optional
from modules.user.entities.user_entity import UserEntity
from modules.user.repositories.interfaces import IUserRepository

class UserRepository(IUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: UserEntity) -> UserEntity:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user) # Atualiza a instância com dados do DB (como o ID gerado)
        return user

    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        # Uso de .is_(True) evita warnings do SQLAlchemy em comparações booleanas
        return self.db.query(UserEntity).filter(
            UserEntity.id == user_id, 
            UserEntity.ativo.is_(True)
        ).first()

    def get_all(self, skip: int = 0, limit: int = 10, nome: Optional[str] = None, email: Optional[str] = None) -> List[UserEntity]:
        query = self.db.query(UserEntity).filter(UserEntity.ativo.is_(True))
        
        if nome:
            query = query.filter(UserEntity.nome.ilike(f"%{nome}%"))
        if email:
            query = query.filter(UserEntity.email.ilike(f"%{email}%"))
        
        return query.offset(skip).limit(limit).all()

    def update(self, user: UserEntity) -> UserEntity:
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_by_email(self, email: str) -> Optional[UserEntity]:
        """Busca um usuário no banco de dados filtrando pela coluna exata de e-mail."""
        return self.db.query(UserEntity).filter(UserEntity.email == email).first()

    def delete(self, user: UserEntity) -> None:
        user.ativo = False # Soft delete
        self.db.commit()