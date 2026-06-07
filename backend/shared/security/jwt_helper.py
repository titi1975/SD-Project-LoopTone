import jwt
from datetime import datetime, timedelta, timezone

# Em produção, isso DEVE vir do arquivo .env
SECRET_KEY = "super_senha_secreta_para_criptografia_do_looptone" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # Token válido por 7 dias

class JWTHelper:
    @staticmethod
    def create_access_token(user_id: int) -> str:
        # Define quando o token vai expirar
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # O "payload" é o conteúdo do token. "sub" (Subject) guarda quem é o usuário.
        payload = {
            "sub": str(user_id),
            "exp": expire
        }
        
        # Gera o token assinado
        encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt