import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AuthShell } from "../components/AuthShell";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { authService } from "../../service/auth-service";
import { SuccessModal } from "../../../../commons/components/SuccessModal";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (code.length !== 6) {
      setFeedback("O código deve conter exatamente 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail({ email: emailParam, code });
      setShowSuccess(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <SuccessModal 
        isOpen={showSuccess} 
        title="Conta Ativada!" 
        message="Seu e-mail foi confirmado com sucesso. Você já pode acessar a plataforma."
        buttonText="Ir para o Login"
        onConfirm={() => navigate("/login")}
      />
      
      <form className="register-card" onSubmit={handleSubmit} style={{ width: "min(100%, 450px)", textAlign: "center" }}>
        <h1 style={{ color: "var(--primary)", fontSize: "1.7rem", fontWeight: 800, margin: "0 0 12px" }}>Confirme seu E-mail</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 24px" }}>
          Enviamos um código de 6 dígitos para <strong>{emailParam}</strong>. Insira-o abaixo para liberar seu acesso.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          style={{ fontSize: "2rem", textAlign: "center", letterSpacing: "8px", fontWeight: 800, marginBottom: "16px" }}
          required
        />

        {feedback && <p className="form-feedback" style={{ marginBottom: "16px" }}>{feedback}</p>}

        <PrimaryButton disabled={loading || !emailParam} type="submit" style={{ width: "100%" }}>
          {loading ? "Verificando..." : "Validar Código"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}