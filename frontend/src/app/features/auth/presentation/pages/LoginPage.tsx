import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { SlidersHorizontal, Music, Sparkles, Save, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { LoopToneLogo } from "../../../../commons/components/LoopToneLogo";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { authService } from "../../service/auth-service";
import { useAuthStore } from "../../service/auth-store";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false); // Estado para o olho da senha
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("looptone-theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else {
      root.classList.remove("dark-theme");
    }
    localStorage.setItem("looptone-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setLoading(true);

    try {
      const session = await authService.login({ email, senha });
      setSession(session.accessToken, session.user);
      navigate("/novo-timbre");
    } catch (error: any) {
      // Tradução de mensagens de erro no login
      if (error.response && error.response.status === 401) {
        setFeedback("E-mail ou senha incorretos.");
      } else if (error.response && error.response.data && error.response.data.message) {
        setFeedback(error.response.data.message);
      } else {
        setFeedback("Não foi possível entrar. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 10 }}>
        <button
          onClick={toggleTheme}
          type="button"
          className="theme-toggle-btn"
          aria-label={theme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro"}
          style={{ padding: 0 }}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <section className="login-brand-panel" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-20%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(123, 77, 245, 0.15) 0%, rgba(90, 34, 214, 0) 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ zIndex: 2, position: "relative" }}>
          <LoopToneLogo size="lg" />
          <p className="brand-copy" style={{ fontSize: "1.1rem", color: "var(--text)", lineHeight: 1.5, fontWeight: 500, margin: "1rem 0" }}>
            Cadastre seu setup, descreva o timbre que quer atingir.
            <br />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 400 }}>
              O sistema faz a análise espectral do sinal e a inteligência artificial analisa o sinal, compara espectralmente e refina as configurações a cada iteração.
            </span>
          </p>

          <ul className="feature-list" style={{ display: "grid", gap: "0.6rem" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-soft)", border: "1px solid var(--line)", padding: "10px 14px", borderRadius: "12px", boxShadow: "var(--shadow-soft)" }}>
              <SlidersHorizontal size={18} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>Cadastre seu equipamento uma vez</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-soft)", border: "1px solid var(--line)", padding: "10px 14px", borderRadius: "12px", boxShadow: "var(--shadow-soft)" }}>
              <Music size={18} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>Envie o áudio do seu equipamento e descreva o timbre objetivo</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-soft)", border: "1px solid var(--line)", padding: "10px 14px", borderRadius: "12px", boxShadow: "var(--shadow-soft)" }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>A IA compara espectralmente a cada loop</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-soft)", border: "1px solid var(--line)", padding: "10px 14px", borderRadius: "12px", boxShadow: "var(--shadow-soft)" }}>
              <Save size={18} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>Salve os presets finais para sempre</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="login-form-panel">
        <form className="login-form" onSubmit={handleSubmit} style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--line)", boxShadow: "var(--shadow-soft)" }}>
          <h1 style={{ color: "var(--primary)", fontSize: "1.7rem", fontWeight: 800, margin: "0 0 4px" }}>Entrar</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 16px" }}>Acesse sua conta para refinar seus timbres</p>

          <label style={{ display: "grid", gap: "4px", marginBottom: "12px" }}>
            <span>E-mail</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>

          <label style={{ display: "grid", gap: "4px", marginBottom: "16px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span>Senha</span>
              <Link to="/esqueci-minha-senha" style={{ color: "var(--primary-2)", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}>
                Esqueceu a senha?
              </Link>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                type={showSenha ? "text" : "password"}
                style={{ paddingRight: "2.5rem" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                style={{ position: "absolute", right: "12px", background: "transparent", border: 0, color: "var(--muted)", display: "flex", alignItems: "center", padding: 0 }}
              >
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {feedback && <p className="form-feedback" style={{ marginBottom: "10px" }}>{feedback}</p>}

          <PrimaryButton disabled={loading} type="submit" style={{ height: "2.8rem", borderRadius: "12px" }}>
            {loading ? "Entrando..." : "Entrar na sua conta"}
          </PrimaryButton>

          <p className="account-link" style={{ marginTop: "14px", fontSize: "0.9rem" }}>
            Não tem conta? <Link to="/cadastro" style={{ color: "var(--primary)", fontWeight: 700 }}>Criar Conta</Link>
          </p>
        </form>
      </section>
    </main>
  );
}