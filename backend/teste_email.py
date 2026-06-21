import os
import smtplib
from dotenv import load_dotenv

load_dotenv()

email_remetente = os.getenv("SMTP_EMAIL")
senha_app = os.getenv("SMTP_PASSWORD")

print("--- INICIANDO DIAGNÓSTICO SMTP ---")
print(f"E-mail lido do .env: '{email_remetente}'")
print(f"Senha lida do .env: '{'***' if senha_app else 'VAZIA'}'")

if not email_remetente or not senha_app:
    print(" ERRO: Variáveis não encontradas. Verifique o nome do seu arquivo .env")
else:
    try:
        # Tenta conectar ao Google exibindo todo o tráfego de rede (debuglevel=1)
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.set_debuglevel(1) 
        server.starttls()
        server.login(email_remetente, senha_app)
        
        print("\n SUCESSO ABSOLUTO! A autenticação com o Google funcionou.")
        server.quit()
    except Exception as e:
        print(f"\n O GOOGLE BLOQUEOU A CONEXÃO. Motivo:\n{e}")