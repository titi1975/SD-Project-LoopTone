import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AudioWaveform, Sun, Moon, Sparkles } from "lucide-react";
import { useCreditsStore } from "../../features/auth/service/credits-store";

type TopbarProps = {
  activeTab: "novo-timbre" | "meus-timbres" | "equipamentos" | "";
};

export function Topbar({ activeTab }: TopbarProps) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("looptone-theme") || "light");
  const { credits, checkAndRefreshCredits, isPremium } = useCreditsStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else {
      root.classList.remove("dark-theme");
    }
    localStorage.setItem("looptone-theme", theme);
  }, [theme]);

  useEffect(() => {
    checkAndRefreshCredits();
  }, [checkAndRefreshCredits]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <header className="topbar">
      <button className="brand" onClick={() => navigate("/novo-timbre")} aria-label="Ir ao início">
        <span className="brand-mark"><AudioWaveform size={26} /></span>
        <span><strong>Loop</strong>Tone</span>
      </button>

      <nav className="nav-pills">
        <button
          className={`nav-pill ${activeTab === "novo-timbre" ? "active" : ""}`}
          onClick={() => navigate("/novo-timbre")}
        >
          Novo Timbre
        </button>
        <button
          className={`nav-pill ${activeTab === "meus-timbres" ? "active" : ""}`}
          onClick={() => navigate("/meus-timbres")}
        >
          Meus Timbres
        </button>
        <button
          className={`nav-pill ${activeTab === "equipamentos" ? "active" : ""}`}
          onClick={() => navigate("/equipamentos")}
        >
          Equipamentos
        </button>
      </nav>

      <div className="account-area">
        <button
          className="credits-btn"
          onClick={() => navigate("/assinatura")}
          title={isPremium ? "Plano Premium Ativo" : "Obter mais créditos"}
        >
          {isPremium && <Sparkles size={13} style={{ color: "var(--warning)" }} />}
          Créditos: {credits}
        </button>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label={theme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro"}
          style={{ padding: 0 }}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <span className="timbre-avatar" aria-hidden="true" style={{ width: "38px", height: "38px" }} />
      </div>
    </header>
  );
}
