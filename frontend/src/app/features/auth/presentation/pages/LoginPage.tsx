import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleButton } from "../../../../commons/components/GoogleButton";
import { LoopToneLogo } from "../../../../commons/components/LoopToneLogo";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { authService } from "../../service/auth-service";
import { useAuthStore } from "../../service/auth-store";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setLoading(true);

    try {
      const session = await authService.login({ email, senha });
      setSession(session.accessToken, session.user);
      navigate("/setup");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <LoopToneLogo />
        <p className="brand-copy">
          Cadastre seu setup, descreva o timbre que quer atingir
          <br />
          IA analisa, compara espectralmente e refina a cada iteração.
        </p>
        <ul className="feature-list">
          <li>▧ Cadastre seu equipamento uma vez</li>
          <li>▥ Envie o áudio de referência e descreva o timbre</li>
          <li>IA A IA compara espectralmente a cada loop</li>
          <li>▤ Salve os presets finais para sempre</li>
        </ul>
      </section>

      <section className="login-form-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Entrar</h1>
          
          <label>
            <span>E-mail</span>
            <input 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              type="email" 
              required 
            />
          </label>
          
          <label>
            <span>Senha</span>
            <input 
              value={senha} 
              onChange={(event) => setSenha(event.target.value)} 
              type="password" 
              required 
            />
          </label>
          
          {feedback && <p className="form-feedback">{feedback}</p>}
          
          <PrimaryButton disabled={loading} type="submit">
            {loading ? "Entrando..." : "Entrar na sua conta"}
          </PrimaryButton>
          
          <div className="divider">
            <span />
            ou
            <span />
          </div>
          
          <GoogleButton disabled />
          
          <p className="account-link">
            Não tem conta? <Link to="/cadastro">Criar Conta</Link>
          </p>
        </form>
      </section>
    </main>
  );
}