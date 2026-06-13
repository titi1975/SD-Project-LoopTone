import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../../auth/service/auth-store";
import { equipmentService } from "../../../equipment/service/equipment-service";
import { useEquipmentStore } from "../../../equipment/service/equipment-store";
import { useTimbreStore } from "../../service/timbre-store";
import { ListMusic, Trash2, Guitar, SlidersHorizontal } from "lucide-react";
import { Topbar } from "../../../../commons/components/Topbar";

export function MyTimbresPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const projects = useTimbreStore((state) => state.projects);
  const deleteProject = useTimbreStore((state) => state.deleteProject);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!user) return;

    equipmentService
      .listByUser(user.id)
      .then(setEquipments)
      .catch(() => {
        setFeedback("Não foi possível carregar os setups de equipamentos.");
      });
  }, [setEquipments, user]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? projects[0];

  function handleDelete(id: string) {
    if (confirm("Deseja realmente excluir esta análise de timbre?")) {
      deleteProject(id);
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    }
  }

  // Encontra o setup utilizado na análise
  const projectSetup = selectedProject ? equipments.find((eq) => eq.id === selectedProject.equipmentId) : null;

  const adjustments = selectedProject?.adjustments ?? [];
  const missingElements = selectedProject?.missingElements ?? [];
  const analysisSummary = selectedProject?.analysisSummary ?? "";

  let formattedDate = "";
  if (selectedProject?.createdAt) {
    try {
      const d = new Date(selectedProject.createdAt);
      if (!isNaN(d.getTime())) {
        formattedDate = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }).format(d);
      }
    } catch {
      // ignore
    }
  }

  return (
    <main className="app-shell">
      <Topbar activeTab="meus-timbres" />

      <section className="workbench-layout">
        <aside className="sidebar-card">
          <div className="sidebar-title">
            <span>Meus Timbres</span>
            <ListMusic size={18} />
          </div>

          {projects.length === 0 ? (
            <div style={{ padding: "1rem 0" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 1rem" }}>Nenhuma análise de timbre salva.</p>
              <button className="primary-button compact" onClick={() => navigate("/novo-timbre")} style={{ width: "100%" }}>
                Criar primeiro timbre
              </button>
            </div>
          ) : (
            <div className="tone-list">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  className={selectedProject?.id === proj.id ? "tone-item active" : "tone-item"}
                  onClick={() => setSelectedProjectId(proj.id)}
                >
                  <span /> {proj.title}
                </button>
              ))}
            </div>
          )}
        </aside>

        <article className="workspace-card">
          {selectedProject ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                <div>
                  <p className="eyebrow">{selectedProject.instrument} - {selectedProject.artist}</p>
                  <h1 style={{ fontSize: "2rem", margin: 0 }}>{selectedProject.song}</h1>
                  {formattedDate && (
                    <time style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Realizado em: {formattedDate}
                    </time>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(selectedProject.id)}
                  style={{
                    background: "rgba(255, 88, 61, 0.1)",
                    border: 0,
                    borderRadius: "12px",
                    color: "var(--danger)",
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 700
                  }}
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>

              {/* Setup Utilizado */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h2>Setup usado na análise</h2>
                <div className="setup-rack">
                  {projectSetup ? (
                    <>
                      <div className="setup-rack-card">
                        <div className="icon-wrapper"><Guitar size={18} /></div>
                        <div className="card-content">
                          <span className="card-label">Instrumento</span>
                          <span className="card-value">{projectSetup.instrument?.brand} {projectSetup.instrument?.model} ({projectSetup.instrumentType})</span>
                        </div>
                      </div>

                      <div className="setup-rack-card">
                        <div className="icon-wrapper"><SlidersHorizontal size={18} /></div>
                        <div className="card-content">
                          <span className="card-label">Amplificador</span>
                          <span className="card-value">{(projectSetup.amps ?? []).map((a) => `${a.brand} ${a.model}`).join(", ") || "Nenhum"}</span>
                        </div>
                      </div>

                      {(projectSetup.pedals ?? []).map((pedal, idx) => (
                        <div className="setup-rack-card" key={idx}>
                          <div className="icon-wrapper"><SlidersHorizontal size={18} /></div>
                          <div className="card-content">
                            <span className="card-label">Pedal</span>
                            <span className="card-value">{pedal}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ color: "var(--muted)", fontStyle: "italic" }}>
                      Setup antigo ou excluído (ID: {selectedProject.equipmentId})
                    </div>
                  )}
                </div>
              </div>

              {/* Parâmetros Recomendados */}
              <h2>Ajustes Recomendados</h2>
              <div className="adjustment-step-list">
                {adjustments.length > 0 ? (
                  adjustments.map((adj, idx) => (
                    <div key={idx} className="adjustment-step-card">
                      <div className="step-badge">{idx + 1}</div>
                      <span className="step-text">{adj}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--muted)", fontStyle: "italic" }}>Nenhum ajuste sugerido.</div>
                )}
              </div>

              {/* Análise Técnica e Sugestões */}
              <h2 style={{ marginTop: "2rem" }}>Análise do Timbre</h2>
              <div className="analysis-quote-card">
                <p style={{ margin: 0, lineHeight: 1.6, color: "var(--text)", fontWeight: 500 }}>{analysisSummary}</p>
              </div>

              {missingElements && missingElements.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <h2>Sugestões de melhoria (itens ausentes)</h2>
                  <div className="missing-elements-grid">
                    {missingElements.map((el, idx) => (
                      <div key={idx} className="missing-element-card">
                        <div className="warning-dot" />
                        <span>{el}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
              <h1 style={{ color: "var(--primary)" }}>Meus Timbres</h1>
              <p style={{ color: "var(--muted)", maxWidth: "450px", margin: "0 auto 2rem" }}>Nenhuma análise de timbre carregada. Crie uma nova análise comparando seu som com uma referência.</p>
              <button className="primary-button" onClick={() => navigate("/novo-timbre")}>Analisar Timbre</button>
            </div>
          )}

          {feedback && <p className="form-feedback" style={{ marginTop: "1rem" }}>{feedback}</p>}
        </article>
      </section>
    </main>
  );
}
