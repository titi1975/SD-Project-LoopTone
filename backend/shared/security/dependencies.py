from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from shared.exceptions.base_exceptions import UnauthorizedException
from shared.security.jwt_helper import SECRET_KEY, ALGORITHM

# MUDANÇA AQUI: Trocamos OAuth2PasswordBearer pelo HTTPBearer
security_scheme = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> int:
    """
    Dependência (Cadeado) que intercepta a requisição, valida o JWT e retorna o ID do usuário.
    """
    try:
        # O HTTPBearer extrai o token e o coloca dentro da propriedade 'credentials'
        token = credentials.credentials
        
        # Tenta abrir o "Cartão Magnético" usando a chave mestra
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extrai o "sub" (subject) que contém o ID do usuário
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise UnauthorizedException("Token inválido: credenciais não encontradas.")
            
        return int(user_id_str)
        
    except ExpiredSignatureError:
        raise UnauthorizedException("O seu token expirou. Faça login novamente.")
    except InvalidTokenError:
        raise UnauthorizedException("Token de autenticação inválido ou adulterado.")