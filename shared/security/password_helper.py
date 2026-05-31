import bcrypt

class PasswordHelper:
    """Utilitário estático para lidar com segurança de senhas."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        pwd_bytes = password.encode('utf-8')
        # bcrypt.gensalt() cria o salt dinâmico que fica acoplado ao hash
        hashed_bytes = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
        return hashed_bytes.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)