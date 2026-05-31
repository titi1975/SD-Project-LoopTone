from abc import ABC, abstractmethod
from typing import List, Optional
from modules.user.entities.user_entity import UserEntity

class IUserRepository(ABC):
    """
    Contrato que garante a Inversão de Dependência 
    Os Casos de Uso dependem desta abstração, não do banco de dados diretamente.
    """
    @abstractmethod
    def create(self, user: UserEntity) -> UserEntity: pass
    
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[UserEntity]: pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[UserEntity]: pass
    
    @abstractmethod
    def get_all(self, skip: int, limit: int, nome: Optional[str], email: Optional[str]) -> List[UserEntity]: pass
    
    @abstractmethod
    def update(self, user: UserEntity) -> UserEntity: pass
    
    @abstractmethod
    def delete(self, user: UserEntity) -> None: pass
