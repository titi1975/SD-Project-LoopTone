class DomainException(Exception):
    """Classe base para erros de negócio."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class NotFoundException(DomainException):
    """Lançada quando um recurso não é encontrado."""
    pass

class BusinessRuleException(DomainException):
    """Lançada quando uma regra de negócio é violada (ex: Email já em uso)."""
    pass