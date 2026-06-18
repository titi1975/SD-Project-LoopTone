import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router";
import { AuthShell } from "../components/AuthShell";
import { FormInput } from "../../../../commons/components/FormInput";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { authService } from "../../service/auth-service";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setLoading(true);

    try {
      await authService.forgotPassword({ email });
      // Redireciona silenciosamente para a tela de inserir o token
      navigate(`/redefinir-senha?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setFeedback("Ocorreu um erro ao tentar enviar o e-mail.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <form className="register-card" onSubmit={handleSubmit} style={{ width: "min(100%, 450px)" }}>
        <h1 style={{ color: "var(--primary)", fontSize: "1.7rem", fontWeight: 800, margin: "0 0 12px" }}>Recuperar Senha</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 24px" }}>
          Digite o e-mail associado à sua conta. Enviaremos um token de segurança para você criar uma nova senha.
        </p>

        <FormInput 
          label="E-mail" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        {feedback && <p className="form-feedback" style={{ marginTop: "12px" }}>{feedback}</p>}

        <PrimaryButton disabled={loading} type="submit" style={{ width: "100%", marginTop: "24px" }}>
          {loading ? "Enviando..." : "Receber Token"}
        </PrimaryButton>

        <Link className="back-link" to="/login" style={{ display: "block", textAlign: "center", marginTop: "16px" }}>
          Voltar para o Login
        </Link>
      </form>
    </AuthShell>
  );
}