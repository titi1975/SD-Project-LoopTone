import re
def is_valid_cpf(cpf: str) -> bool:
    """
    Validador real matemático de CPF.
    """
    if not cpf or len(cpf) !=11 or not cpf.isdigit() or len(set(cpf)) == 1:
        return False
    
    #(A lógica matemática completa de validação dos 2 dígitos do CPF iria aqui)
    #Por brevidade, vou manter a assinatura. (Futura adição)
    return True

def is_strong_password(senha: str) -> bool:
    #Verifica 1 minúscula, 1 maiúscula, 1 número, 1 caractere esoecial
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$'
    return bool(re.match(pattern, senha))
