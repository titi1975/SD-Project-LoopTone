import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FormInput } from "../../../../commons/components/FormInput";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { AuthShell } from "../components/AuthShell";
import { AuthStepper } from "../components/AuthStepper";
import { authService } from "../../service/auth-service";
import { useAuthStore } from "../../service/auth-store";
import type { RegisterUserPayload } from "../../service/auth-types";
import { useCreditsStore } from "../../service/credits-store";

const initialForm = {
  nome: "",
  sobrenome: "",
  idade: "",
  cep: "",
  endereco: "",
  numeroResidencia: "",
  email: "",
  cpf: "",
  senha: "",
  confirmarSenha: "",
  aceitouTermos: false,
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

    // Validações no cliente
    if (form.senha !== form.confirmarSenha) {
      setFeedback("As senhas precisam ser iguais.");
      return;
    }

    const cleanCpf = form.cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setFeedback("O CPF precisa ter exatamente 11 dígitos numéricos.");
      return;
    }

    const cleanCep = form.cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setFeedback("O CEP precisa ter exatamente 8 dígitos numéricos.");
      return;
    }

    const age = parseInt(form.idade, 10);
    if (isNaN(age) || age <= 0 || age >= 150) {
      setFeedback("Por favor, insira uma idade válida (entre 1 e 149).");
      return;
    }

    const residenceNumber = parseInt(form.numeroResidencia, 10);
    if (isNaN(residenceNumber) || residenceNumber <= 0) {
      setFeedback("Por favor, insira um número residencial válido.");
      return;
    }

    // Validação de força de senha
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordPattern.test(form.senha)) {
      setFeedback(
        "A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
      );
      return;
    }

    if (!form.aceitouTermos) {
      setFeedback("Você precisa aceitar os Termos de Uso.");
      return;
    }

    setLoading(true);

    const payload: RegisterUserPayload = {
      nome: form.nome.trim(),
      sobrenome: form.sobrenome.trim(),
      idade: age,
      cep: cleanCep,
      endereco: form.endereco.trim(),
      numeroResidencia: residenceNumber,
      email: form.email.trim(),
      cpf: cleanCpf,
      senha: form.senha,
      aceitouTermos: form.aceitouTermos,
    };

    try {
      await authService.register(payload);
      const session = await authService.login({ email: form.email, senha: form.senha });
      useCreditsStore.getState().resetCredits(); // Garante os 5 créditos iniciais para a nova conta
      setSession(session.accessToken, session.user);
      navigate("/setup");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthStepper activeStep={1} />
      <form className="register-card" onSubmit={handleSubmit} style={{ maxWidth: "700px" }}>
        <div className="register-grid responsive-grid-2">
          <FormInput label="Nome" value={form.nome} onChange={(event) => updateField("nome", event.target.value)} required />
          <FormInput label="Sobrenome" value={form.sobrenome} onChange={(event) => updateField("sobrenome", event.target.value)} required />
          <FormInput label="E-mail" value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" required />
          <FormInput label="CPF (Apenas números)" value={form.cpf} onChange={(event) => updateField("cpf", event.target.value)} maxLength={11} required />
          <FormInput label="Idade" value={form.idade} onChange={(event) => updateField("idade", event.target.value)} type="number" required />
          <FormInput label="CEP (Apenas números)" value={form.cep} onChange={(event) => updateField("cep", event.target.value)} maxLength={8} required />
          <FormInput label="Endereço" value={form.endereco} onChange={(event) => updateField("endereco", event.target.value)} required />
          <FormInput label="Nº Residência" value={form.numeroResidencia} onChange={(event) => updateField("numeroResidencia", event.target.value)} type="number" required />
          <FormInput label="Senha" value={form.senha} onChange={(event) => updateField("senha", event.target.value)} type="password" required />
          <FormInput
            label="Confirme a Senha"
            value={form.confirmarSenha}
            onChange={(event) => updateField("confirmarSenha", event.target.value)}
            type="password"
            required
          />
        </div>

        <label className="terms-row" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="checkbox"
            checked={form.aceitouTermos}
            onChange={(event) => updateField("aceitouTermos", event.target.checked)}
            required
          />
          <span>Eu li e aceito os Termos de Uso e Políticas de Privacidade</span>
        </label>

        {feedback && <p className="form-feedback" style={{ color: "var(--danger, #ff583d)", marginTop: "0.5rem" }}>{feedback}</p>}

        <div className="register-actions" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", alignItems: "center" }}>
          <PrimaryButton disabled={loading} type="submit">
            {loading ? "Criando..." : "Criar sua conta"}
          </PrimaryButton>
        </div>
        <Link className="back-link" to="/login" style={{ display: "block", textAlign: "center", marginTop: "1rem" }}>
          Já tenho conta
        </Link>
      </form>
    </AuthShell>
  );
}
