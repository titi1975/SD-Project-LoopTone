import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FormInput } from "../../../../commons/components/FormInput";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { AuthShell } from "../components/AuthShell";
import { AuthStepper } from "../components/AuthStepper";
import { LegalModal } from "../../../../commons/components/LegalModal";
import { authService } from "../../service/auth-service";
import type { RegisterUserPayload } from "../../service/auth-types";
import { useCreditsStore } from "../../service/credits-store";
import { Eye, EyeOff } from "lucide-react";

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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: "terms" | "privacy" }>({ isOpen: false, type: "terms" });
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  function updateField<T extends keyof typeof form>(field: T, value: (typeof form)[T]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const localErrors: Record<string, string> = {};

    // --- MURALHA DE VALIDAÇÃO DO FRONTEND ---
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s']+$/;
    if (!form.nome.trim()) {
      localErrors["nome"] = "O nome não pode estar vazio.";
    } else if (!nameRegex.test(form.nome)) {
      localErrors["nome"] = "O nome deve conter apenas letras.";
    }

    if (!form.sobrenome.trim()) {
      localErrors["sobrenome"] = "O sobrenome não pode estar vazio.";
    } else if (!nameRegex.test(form.sobrenome)) {
      localErrors["sobrenome"] = "O sobrenome deve conter apenas letras.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      localErrors["email"] = "O e-mail não pode estar vazio.";
    } else if (!emailRegex.test(form.email)) {
      localErrors["email"] = "Insira um e-mail válido.";
    }

    const cleanCpf = form.cpf.replace(/\D/g, "");
    if (!form.cpf.trim()) {
      localErrors["cpf"] = "O CPF não pode estar vazio.";
    } else if (cleanCpf.length !== 11) {
      localErrors["cpf"] = "O CPF deve conter exatamente 11 números.";
    }

    if (!form.idade) {
      localErrors["idade"] = "A idade não pode estar vazia.";
    } else {
      const age = parseInt(form.idade.toString(), 10);
      if (isNaN(age) || age <= 0 || age >= 150) {
        localErrors["idade"] = "Insira uma idade válida (entre 1 e 149).";
      }
    }

    const cleanCep = form.cep.replace(/\D/g, "");
    if (!form.cep.trim()) {
      localErrors["cep"] = "O CEP não pode estar vazio.";
    } else if (cleanCep.length !== 8) {
      localErrors["cep"] = "O CEP deve conter exatamente 8 números.";
    }

    if (!form.endereco.trim()) {
      localErrors["endereco"] = "O endereço não pode estar vazio.";
    }

    if (!form.numeroResidencia) {
      localErrors["numeroResidencia"] = "O número da residência é obrigatório.";
    } else {
      const resNum = parseInt(form.numeroResidencia.toString(), 10);
      if (isNaN(resNum) || resNum <= 0) {
        localErrors["numeroResidencia"] = "Insira um número válido.";
      }
    }

    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!form.senha) {
      localErrors["senha"] = "A senha não pode estar vazia.";
    } else if (!strongPasswordPattern.test(form.senha)) {
      localErrors["senha"] = "Requisitos: Mín. 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.";
    }

    if (!form.confirmarSenha) {
      localErrors["confirmarSenha"] = "Confirme sua senha.";
    } else if (form.senha !== form.confirmarSenha) {
      localErrors["confirmarSenha"] = "As senhas digitadas precisam ser iguais.";
    }

    if (!form.aceitouTermos) {
      localErrors["aceitouTermos"] = "Você precisa aceitar os Termos de Uso e Políticas de Privacidade.";
    }

    // Se houve erro local, a função encerra aqui. O botão NÃO muda para "Criando...".
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }
    // --- FIM DA MURALHA ---

    // A partir daqui, a requisição vai para a API
    setLoading(true);
    const requestStartTime = Date.now(); // Marca o momento exato em que a requisição iniciou

    const payload: RegisterUserPayload = {
      nome: form.nome.trim(),
      sobrenome: form.sobrenome.trim(),
      idade: parseInt(form.idade.toString(), 10),
      cep: cleanCep,
      endereco: form.endereco.trim(),
      numeroResidencia: parseInt(form.numeroResidencia.toString(), 10),
      email: form.email.trim(),
      cpf: cleanCpf,
      senha: form.senha,
      aceitouTermos: form.aceitouTermos,
    };

    try {
      await authService.register(payload);
      useCreditsStore.getState().resetCredits(); 
      navigate(`/verificar-email?email=${encodeURIComponent(form.email.trim())}`);
    } catch (error: any) {
      let errorMessage = "Erro na comunicação com o servidor.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : "Verifique os dados informados.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const lowerMsg = errorMessage.toLowerCase();
      const backendErrors: Record<string, string> = {};

      if (lowerMsg.includes("cpf") || lowerMsg.includes("users_cpf_key") || lowerMsg.includes("cadastrados")) {
        backendErrors["cpf"] = "Este CPF já está vinculado a outra conta.";
      } 
      
      if (lowerMsg.includes("e-mail") || lowerMsg.includes("email") || lowerMsg.includes("cadastrado") || lowerMsg.includes("cadastrados")) {
        backendErrors["email"] = "Este e-mail já está em uso.";
      } 

      if (Object.keys(backendErrors).length > 0) {
        setFieldErrors(backendErrors);
      } else {
        setFieldErrors({ global: errorMessage });
      }

    } finally {
      // --- SUAVIDADE DE UX APLICADA AQUI ---
      const elapsedTime = Date.now() - requestStartTime;
      const minimumLoadingTime = 500; // Define meio segundo como o mínimo aceitável

      if (elapsedTime < minimumLoadingTime) {
        // Se a API respondeu rápido demais, aguardamos o tempo restante para tirar o "Criando..."
        setTimeout(() => {
          setLoading(false);
        }, minimumLoadingTime - elapsedTime);
      } else {
        // Se a requisição demorou normalmente (ex: deploy em nuvem), libera na hora
        setLoading(false);
      }
    }
  }

  return (
    <AuthShell>
      <AuthStepper activeStep={1} />
      
      <LegalModal 
        isOpen={legalModal.isOpen} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ isOpen: false, type: "terms" })} 
      />

      <form className="register-card" onSubmit={handleSubmit} noValidate style={{ maxWidth: "700px", width: "100%" }}>
        <div className="register-grid responsive-grid-2">
          <FormInput label="Nome" value={form.nome} onChange={(event) => updateField("nome", event.target.value)} error={fieldErrors["nome"]} />
          <FormInput label="Sobrenome" value={form.sobrenome} onChange={(event) => updateField("sobrenome", event.target.value)} error={fieldErrors["sobrenome"]} />
          <FormInput label="E-mail" value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" error={fieldErrors["email"]} />
          <FormInput label="CPF (Apenas números)" value={form.cpf} onChange={(event) => updateField("cpf", event.target.value)} maxLength={11} error={fieldErrors["cpf"]} />
          <FormInput label="Idade" value={form.idade} onChange={(event) => updateField("idade", event.target.value)} type="number" error={fieldErrors["idade"]} />
          <FormInput label="CEP (Apenas números)" value={form.cep} onChange={(event) => updateField("cep", event.target.value)} maxLength={8} error={fieldErrors["cep"]} />
          <FormInput label="Endereço" value={form.endereco} onChange={(event) => updateField("endereco", event.target.value)} error={fieldErrors["endereco"]} />
          <FormInput label="Nº Residência" value={form.numeroResidencia} onChange={(event) => updateField("numeroResidencia", event.target.value)} type="number" error={fieldErrors["numeroResidencia"]} />
          
          <div style={{ display: "grid", gap: "4px", position: "relative" }}>
            <label className="form-field">
              <span>Senha</span>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  value={form.senha}
                  onChange={(event) => updateField("senha", event.target.value)}
                  type={showSenha ? "text" : "password"}
                  style={{ paddingRight: "2.5rem", borderColor: fieldErrors["senha"] ? "var(--danger)" : "var(--line)", boxShadow: fieldErrors["senha"] ? "0 0 0 2px rgba(255, 88, 61, 0.1)" : undefined }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  style={{ position: "absolute", right: "12px", background: "transparent", border: 0, color: "var(--muted)", display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {fieldErrors["senha"] && <span style={{ color: "var(--danger)", fontSize: "0.78rem", fontWeight: 600 }}>{fieldErrors["senha"]}</span>}
          </div>

          <div style={{ display: "grid", gap: "4px", position: "relative" }}>
            <label className="form-field">
              <span>Confirme a Senha</span>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  value={form.confirmarSenha}
                  onChange={(event) => updateField("confirmarSenha", event.target.value)}
                  type={showConfirmarSenha ? "text" : "password"}
                  style={{ paddingRight: "2.5rem", borderColor: fieldErrors["confirmarSenha"] ? "var(--danger)" : "var(--line)", boxShadow: fieldErrors["confirmarSenha"] ? "0 0 0 2px rgba(255, 88, 61, 0.1)" : undefined }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  style={{ position: "absolute", right: "12px", background: "transparent", border: 0, color: "var(--muted)", display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  {showConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {fieldErrors["confirmarSenha"] && <span style={{ color: "var(--danger)", fontSize: "0.78rem", fontWeight: 600 }}>{fieldErrors["confirmarSenha"]}</span>}
          </div>
        </div>

        <label className="terms-row" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="checkbox"
            checked={form.aceitouTermos}
            onChange={(event) => updateField("aceitouTermos", event.target.checked)}
          />
          <span style={{ fontSize: "0.9rem" }}>
            Eu li e aceito os{" "}
            <button type="button" onClick={() => setLegalModal({ isOpen: true, type: "terms" })} style={{ background: "transparent", border: 0, padding: 0, color: "var(--primary-2)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
              Termos de Uso
            </button>{" "}
            e{" "}
            <button type="button" onClick={() => setLegalModal({ isOpen: true, type: "privacy" })} style={{ background: "transparent", border: 0, padding: 0, color: "var(--primary-2)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
              Políticas de Privacidade
            </button>
          </span>
        </label>
        {fieldErrors["aceitouTermos"] && <p style={{ color: "var(--danger)", fontSize: "0.78rem", fontWeight: 600, margin: "4px 0 0" }}>{fieldErrors["aceitouTermos"]}</p>}

        {fieldErrors["global"] && <p className="form-feedback" style={{ color: "var(--danger)", marginTop: "0.5rem", textAlign: "center" }}>{fieldErrors["global"]}</p>}

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