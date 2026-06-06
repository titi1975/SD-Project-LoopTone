import re

def validate_text_rules(value: str) -> str:
    if not value or str(value).strip() == "":
        raise ValueError("O campo não pode ser vazio.")
    
    v = str(value).strip()
    
    if "  " in v:
        raise ValueError("Não pode conter dois espaços seguidos.")
    
    alpha_count = len(re.findall(r'[a-zA-ZÀ-ÿ0-9]', v))
    if alpha_count < 4:
        raise ValueError("Deve conter no mínimo 4 caracteres alfanuméricos.")
        
    return v