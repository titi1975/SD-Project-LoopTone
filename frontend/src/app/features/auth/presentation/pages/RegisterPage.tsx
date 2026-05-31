import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FormInput } from "../../../../commons/components/FormInput";
import { GoogleButton } from "../../../../commons/components/GoogleButton";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { AuthShell } from "../components/AuthShell";
import { AuthStepper } from "../components/AuthStepper";
import { authService } from "../../service/auth-service";
import { useAuthStore } from "../../service/auth-store";
import type { RegisterUserPayload } from "../../service/auth-types";

const initialForm: RegisterUserPayload & { confirmarSenha: string } = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof typeof form>(field: T, value: (typeof form)[T]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (form.senha !== form.confirmarSenha) {
      setFeedback("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);
    const payload: RegisterUserPayload = {
      nome: form.nome,
      email: form.email,
      senha: form.senha,
    };

    try {
      await authService.register(payload);
      const session = await authService.login({ email: form.email, senha: form.senha });
      setSession(session.accessToken, session.user);
      navigate("/setup");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthStepper activeStep={1} />
      <form className="register-card register-card-compact" onSubmit={handleSubmit}>
        <div className="register-grid register-grid-compact">
          <FormInput label="Nome" value={form.nome} onChange={(event) => updateField("nome", event.target.value)} required />
          <FormInput label="E-mail" value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" required />
          <FormInput label="Senha" value={form.senha} onChange={(event) => updateField("senha", event.target.value)} type="password" required />
          <FormInput
            label="Confirme a senha"
            value={form.confirmarSenha}
            onChange={(event) => updateField("confirmarSenha", event.target.value)}
            type="password"
            required
          />
        </div>

        <label className="terms-row">
          <input type="checkbox" required />
          <span>Termos de Uso</span>
        </label>

        {feedback && <p className="form-feedback">{feedback}</p>}

        <div className="register-actions">
          <GoogleButton disabled />
          <span>ou</span>
          <PrimaryButton disabled={loading} type="submit">
            {loading ? "Criando..." : "Criar sua conta"}
          </PrimaryButton>
        </div>
        <Link className="back-link" to="/login">
          Ja tenho conta
        </Link>
      </form>
    </AuthShell>
  );
}
