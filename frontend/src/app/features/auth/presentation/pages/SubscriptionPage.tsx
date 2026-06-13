import { useState } from "react";
import { Topbar } from "../../../../commons/components/Topbar";
import { useCreditsStore } from "../../service/credits-store";
import { Sparkles, Check, Info, ShieldCheck, Play, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function SubscriptionPage() {
  const navigate = useNavigate();
  const {
    credits,
    isPremium,
    lastSpentTime,
    subscribe,
    unsubscribe,
    spendCredit,
    simulateTimePassage,
    resetCredits,
  } = useCreditsStore();

  const [simulationMsg, setSimulationMsg] = useState("");

  const handleSubscribeToggle = () => {
    if (isPremium) {
      unsubscribe();
      setSimulationMsg("Inscrição cancelada. Você voltou ao Plano Gratuito com 3 créditos.");
    } else {
      subscribe();
      setSimulationMsg("Inscrição realizada! Agora você tem o plano Premium com 20 créditos.");
    }
    setTimeout(() => setSimulationMsg(""), 4000);
  };

  const handleUseCreditSim = () => {
    const success = spendCredit();
    if (success) {
      setSimulationMsg("Você gastou 1 crédito. Restam " + (credits - 1) + " créditos.");
    } else {
      setSimulationMsg("Falha ao gastar crédito. Saldo insuficiente (0 créditos).");
    }
    setTimeout(() => setSimulationMsg(""), 4000);
  };

  const handleSimulateTime = () => {
    simulateTimePassage(48);
    setSimulationMsg("Simulado avanço de 48 horas! Seus créditos foram recarregados de acordo com seu plano.");
    setTimeout(() => setSimulationMsg(""), 4000);
  };

  const handleResetSim = () => {
    resetCredits();
    setSimulationMsg("Simulação resetada! Você voltou ao estado inicial de nova conta (5 créditos).");
    setTimeout(() => setSimulationMsg(""), 4000);
  };

  return (
    <main className="app-shell">
      <Topbar activeTab="" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "800px", margin: "20px auto 0" }}>
        
        {/* Botão de voltar */}
        <button
          onClick={() => navigate("/novo-timbre")}
          style={{
            alignSelf: "flex-start",
            background: "transparent",
            border: 0,
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.9rem",
            padding: "4px 8px"
          }}
        >
          <ArrowLeft size={16} /> Voltar para Análise
        </button>

        {/* Notificação da Simulação */}
        {simulationMsg && (
          <div style={{
            width: "100%",
            padding: "12px 18px",
            background: "linear-gradient(135deg, var(--primary), var(--primary-2))",
            color: "#fff",
            borderRadius: "14px",
            fontSize: "0.9rem",
            fontWeight: 600,
            boxShadow: "var(--shadow-soft)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <Sparkles size={18} style={{ color: "var(--warning)" }} />
            <span>{simulationMsg}</span>
          </div>
        )}

        {/* Card de Assinatura Principal */}
        <section style={{
          background: "var(--surface)",
          border: isPremium ? "2px solid var(--warning)" : "1px solid var(--line)",
          borderRadius: "28px",
          padding: "36px",
          width: "100%",
          boxShadow: "var(--shadow)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {isPremium && (
            <div style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 176, 46, 0.15)",
              color: "var(--warning)",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid var(--warning)"
            }}>
              <ShieldCheck size={14} /> ASSINATURA ATIVA
            </div>
          )}

          <p className="eyebrow" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Potencialize suas análises
          </p>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text)", margin: "8px 0 16px" }}>
            LoopTone Pro
          </h1>

          {/* Preço */}
          <div style={{ margin: "24px 0" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--muted)", verticalAlign: "middle" }}>R$</span>
            <span style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1, margin: "0 4px" }}>15</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--muted)", verticalAlign: "middle" }}>/ mês</span>
          </div>

          <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: "450px", margin: "0 auto 28px", lineHeight: 1.5 }}>
            Acesso completo e ampliação dos créditos para realizar análises contínuas de timbres de equipamentos reais ou virtuais.
          </p>

          {/* Benefícios */}
          <div style={{
            display: "grid",
            gap: "14px",
            maxWidth: "400px",
            margin: "0 auto 36px",
            textAlign: "left"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(46, 200, 118, 0.1)", color: "var(--success)", alignItems: "center", justifySelf: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={14} />
              </span>
              <span style={{ color: "var(--text)", fontSize: "0.95rem", fontWeight: 600 }}>
                <strong>20 créditos</strong> a cada 48h (não acumulativo)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(46, 200, 118, 0.1)", color: "var(--success)", alignItems: "center", justifySelf: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={14} />
              </span>
              <span style={{ color: "var(--text)", fontSize: "0.95rem", fontWeight: 600 }}>
                Análise com Gemini de alta velocidade
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(46, 200, 118, 0.1)", color: "var(--success)", alignItems: "center", justifySelf: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={14} />
              </span>
              <span style={{ color: "var(--text)", fontSize: "0.95rem", fontWeight: 600 }}>
                Checklist completo de setups ilimitados
              </span>
            </div>
          </div>

          {/* Botão de Assinar */}
          <button
            onClick={handleSubscribeToggle}
            className="primary-button"
            style={{
              maxWidth: "320px",
              margin: "0 auto",
              background: isPremium ? "var(--surface-soft)" : "linear-gradient(135deg, var(--primary-2), var(--primary))",
              color: isPremium ? "var(--danger)" : "#fff",
              border: isPremium ? "1px solid var(--danger)" : "none",
              boxShadow: isPremium ? "none" : "0 12px 26px rgba(90, 34, 214, 0.22)",
            }}
          >
            {isPremium ? "Cancelar Assinatura" : "Assinar Agora"}
          </button>
        </section>

        {/* Card explicativo das Regras do Sistema */}
        <section style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "24px",
          padding: "24px 30px",
          width: "100%",
          boxShadow: "var(--shadow-soft)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)", marginBottom: "16px" }}>
            <Info size={20} />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Regras do Sistema de Créditos</h2>
          </div>

          <div style={{ display: "grid", gap: "16px", fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.5 }}>
            <div style={{ background: "var(--bg)", padding: "14px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>🎉 Boas-vindas</strong>
              Ao criar sua conta, você recebe automaticamente <strong>5 créditos</strong> de cortesia para realizar suas primeiras análises.
            </div>

            <div style={{ background: "var(--bg)", padding: "14px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>🔄 Plano Gratuito (Recarga automática)</strong>
              Após consumir seus 5 créditos iniciais, você entra no modelo gratuito. Nele, você tem um teto de <strong>3 créditos a cada 48 horas</strong> (não acumulativo). Ao gastar créditos, eles serão restaurados ao total de 3 créditos passadas as 48h.
            </div>

            <div style={{ background: "var(--bg)", padding: "14px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>⚡ Plano Pro Premium</strong>
              A assinatura aumenta o seu limite de créditos para <strong>20 créditos a cada 48 horas</strong> (não acumulativos). Ao consumir seus créditos, seu saldo volta a ser 20 créditos após o período de 48 horas do último gasto.
            </div>
          </div>
        </section>

        {/* Seção Interativa para Demonstração */}
        <section style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-purple) 100%)",
          border: "1px solid var(--primary-3)",
          borderRadius: "24px",
          padding: "24px 30px",
          width: "100%",
          boxShadow: "var(--shadow-soft)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary-2)", marginBottom: "16px" }}>
            <Play size={20} />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Simulador do Ciclo de Créditos (Frontend Demo)</h2>
          </div>

          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 0, marginBottom: "20px" }}>
            Use os controles abaixo para testar instantaneamente a lógica de consumo de créditos e a recarga após 48 horas sem ter de esperar o tempo real.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "var(--surface-soft)", padding: "12px 16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700 }}>Créditos Atuais</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>{credits}</div>
            </div>
            <div style={{ background: "var(--surface-soft)", padding: "12px 16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700 }}>Tipo de Conta</span>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: isPremium ? "var(--warning)" : "var(--text)", marginTop: "4px" }}>
                {isPremium ? "PRO (Premium)" : "GRATUITO (Free)"}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: "0.8rem",
            color: "var(--muted)",
            marginBottom: "20px",
            background: "var(--bg)",
            padding: "10px 14px",
            borderRadius: "10px"
          }}>
            <strong>Último gasto registrado:</strong> {lastSpentTime ? new Date(lastSpentTime).toLocaleString("pt-BR") : "Nenhum gasto recente"}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              onClick={handleUseCreditSim}
              className="ghost-button"
              style={{ flex: "1 1 180px", padding: "10px 16px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              Simular Gasto de 1 Crédito
            </button>
            <button
              onClick={handleSimulateTime}
              className="ghost-button"
              style={{ flex: "1 1 180px", padding: "10px 16px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", borderColor: "var(--primary-2)", color: "var(--primary-2)" }}
            >
              Simular Avanço de 48 horas
            </button>
            <button
              onClick={handleResetSim}
              className="ghost-button"
              style={{ flex: "1 1 180px", padding: "10px 16px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--danger)", borderColor: "var(--danger)" }}
            >
              Resetar tudo para Default
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
