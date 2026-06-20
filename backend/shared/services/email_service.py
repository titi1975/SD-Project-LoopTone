import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        # Configurações do .env
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 465
        self.sender_email = os.getenv("SMTP_EMAIL")
        self.sender_password = os.getenv("SMTP_PASSWORD") # Senha de App do Gmail

    def send_verification_email(self, recipient_email: str, code: str, user_name: str):
        subject = "LoopTone - Confirme seu cadastro"
        body = f"""
        <html>
            <body>
                <h2>Olá, {user_name}! Bem-vindo ao LoopTone.</h2>
                <p>Para liberar o seu acesso ao laboratório de timbres, por favor confirme seu e-mail utilizando o código abaixo:</p>
                <h1 style="color: #6a0dad; letter-spacing: 5px;">{code}</h1>
                <p>Este código expira em 15 minutos.</p>
            </body>
        </html>
        """
        self._send_email(recipient_email, subject, body)

    def send_password_reset_email(self, recipient_email: str, reset_token: str, user_name: str):
        subject = "LoopTone - Recuperação de Senha"
        body = f"""
        <html>
            <body>
                <h2>Olá, {user_name}.</h2>
                <p>Recebemos uma solicitação para redefinir sua senha.</p>
                <p>Utilize o token de segurança abaixo no aplicativo para criar uma nova senha:</p>
                <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;"><strong>{reset_token}</strong></p>
                <p>Se você não solicitou isso, ignore este e-mail.</p>
            </body>
        </html>
        """
        self._send_email(recipient_email, subject, body)

    def _send_email(self, to_email: str, subject: str, html_body: str):
        if not self.sender_email or not self.sender_password:
            print("⚠️ AVISO: E-mail não enviado pois as credenciais SMTP faltam no .env")
            return

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Equipe LoopTone <{self.sender_email}>"
        msg["To"] = to_email

        msg.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, msg.as_string())
        except Exception as e:
            print(f"Erro ao disparar e-mail via SMTP: {e}")