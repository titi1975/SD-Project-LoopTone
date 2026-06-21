import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AuthShell } from "../components/AuthShell";
import { FormInput } from "../../../../commons/components/FormInput";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { authService } from "../../service/auth-service";
import { SuccessModal } from "../../../../commons/components/SuccessModal";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [resetToken, setResetToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (novaSenha !== confirmarSenha) {
      setFeedback("As senhas não coincidem.");
      return;
    }

    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordPattern.test(novaSenha)) {
      setFeedback("A nova senha deve conter no mínimo 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email: emailParam, resetToken, novaSenha });
      setShowSuccess(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Token inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <SuccessModal 
        isOpen={showSuccess} 
        title="Senha Alterada!" 
        message="Sua nova senha foi registrada com sucesso."
        buttonText="Fazer Login"
        onConfirm={() => navigate("/login")}
      />

      <form className="register-card" onSubmit={handleSubmit} style={{ width: "min(100%, 450px)" }}>
        <h1 style={{ color: "var(--primary)", fontSize: "1.7rem", fontWeight: 800, margin: "0 0 12px" }}>Criar Nova Senha</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 20px" }}>
          Verifique sua caixa de entrada. Copie o token de segurança enviado para <strong>{emailParam}</strong> e defina sua nova senha.
        </p>

        <div style={{ display: "grid", gap: "16px" }}>
          <FormInput 
            label="Token de Segurança (Enviado por e-mail)" 
            type="text" 
            value={resetToken} 
            onChange={(e) => setResetToken(e.target.value)} 
            required 
          />
          <FormInput 
            label="Nova Senha" 
            type="password" 
            value={novaSenha} 
            onChange={(e) => setNovaSenha(e.target.value)} 
            required 
          />
          <FormInput 
            label="Confirmar Nova Senha" 
            type="password" 
            value={confirmarSenha} 
            onChange={(e) => setConfirmarSenha(e.target.value)} 
            required 
          />
        </div>

        {feedback && <p className="form-feedback" style={{ marginTop: "16px" }}>{feedback}</p>}

        <PrimaryButton disabled={loading || !emailParam} type="submit" style={{ width: "100%", marginTop: "24px" }}>
          {loading ? "Redefinindo..." : "Redefinir Senha"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}