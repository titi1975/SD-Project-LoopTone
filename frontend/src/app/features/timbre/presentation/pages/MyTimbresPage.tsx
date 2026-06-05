import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LoopToneLogo } from "../../../../commons/components/LoopToneLogo";
import { useAuthStore } from "../../../auth/service/auth-store";
import { equipmentService } from "../../../equipment/service/equipment-service";
import { useEquipmentStore } from "../../../equipment/service/equipment-store";
import { useTimbreStore } from "../../service/timbre-store";
import type { TimbreProject } from "../../service/timbre-types";

const emptyTips =
  "Os resumos salvos na conversa aparecem aqui para voce refazer o timbre do zero quando quiser.";

export function MyTimbresPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const projects = useTimbreStore((state) => state.projects);
  const deleteProject = useTimbreStore((state) => state.deleteProject);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null);
  const [feedback, setFeedback] = useState("");

  const handleDeleteProject = (id: string) => {
    if (confirm("Deseja realmente excluir este timbre?")) {
      deleteProject(id);
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    equipmentService
      .listByUser(user.id)
      .then(setEquipments)
      .catch(() => {
        setFeedback("Nao foi possivel atualizar seu setup agora. Mostrei os dados salvos neste navegador.");
      });
  }, [setEquipments, user]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );

  const visibleSettings = useMemo(() => getSettingsFromSummary(selectedProject?.summary), [selectedProject]);

  return (
    <main className="timbre-workspace timbre-library-workspace">
      <header className="timbre-topbar">
        <LoopToneLogo size="sm" />
        <nav className="timbre-nav" aria-label="Navegacao principal">
          <button className="timbre-nav-button" type="button" onClick={() => navigate("/novo-timbre")}>
            <span aria-hidden="true">+</span>
            Novo Timbre
          </button>
          <button className="timbre-nav-button is-active" type="button">
            Meus Timbres
          </button>
          <button className="timbre-nav-button" type="button" onClick={() => navigate("/setup")}>
            Equipamentos
          </button>
        </nav>
        <div className="timbre-account">
          <span>Creditos: 15</span>
          <span className="timbre-avatar" aria-hidden="true" />
        </div>
      </header>

      <aside className="timbre-sidebar timbre-library-sidebar">
        <section className="sidebar-section">
          <div className="sidebar-title-row">
            <h2>Meus Timbres</h2>
          </div>

          <div className="sidebar-chip-list">
            {projects.length === 0 ? (
              <button className="sidebar-chip library-project-chip is-empty" type="button" onClick={() => navigate("/novo-timbre")}>
                Criar primeiro timbre
              </button>
            ) : (
              projects.map((project) => (
                <button
                  className={`sidebar-chip library-project-chip ${project.id === selectedProject?.id ? "is-selected" : ""}`}
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <span className="library-project-dot" aria-hidden="true" />
                  <span className="chip-text">{formatProjectTitle(project)}</span>
                </button>
              ))
            )}
          </div>
        </section>
      </aside>

      <section className="timbre-library-panel" aria-label="Meus Timbres">
        {selectedProject ? (
          <article className="timbre-detail">
            <header className="timbre-detail-header">
              <div className="timbre-detail-title-group">
                <h1>{formatProjectTitle(selectedProject)}</h1>
                <time className="timbre-detail-date" dateTime={selectedProject.updatedAt}>
                  {formatDate(selectedProject.updatedAt)}
                </time>
              </div>
              <button
                className="timbre-detail-delete-button"
                type="button"
                onClick={() => handleDeleteProject(selectedProject.id)}
              >
                Excluir
              </button>
            </header>

            <section className="timbre-detail-section">
              <h2>Setup Usado</h2>
              <div className="library-chip-grid">
                {equipments.length === 0 ? (
                  <span className="library-muted">Nenhum equipamento salvo.</span>
                ) : (
                  equipments.map((equipment) => <span key={equipment.id}>{equipment.name}</span>)
                )}
              </div>
            </section>

            <section className="timbre-detail-section">
              <h2>Parametros Finais</h2>
              <div className="final-parameters-panel">
                {visibleSettings.length === 0 ? (
                  <span className="library-muted">Os parametros finais serao exibidos quando o resumo tiver ajustes sugeridos.</span>
                ) : (
                  <div className="final-parameters-flow">
                    <div className="setting-chip-grid library-setting-grid">
                      {visibleSettings.slice(0, 3).map((setting) => (
                        <span key={setting}>{setting}</span>
                      ))}
                    </div>
                    <span className="flow-arrow" aria-hidden="true">
                      -&gt;
                    </span>
                    <div className="setting-chip-grid library-setting-grid">
                      {visibleSettings.slice(3).map((setting) => (
                        <span key={setting}>{setting}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="timbre-detail-section">
              <h2>Configuracoes e Dicas</h2>
              <div className="summary-panel">
                <p>{selectedProject.summary || emptyTips}</p>
              </div>
            </section>

            {feedback && <p className="timbre-feedback library-feedback">{feedback}</p>}
          </article>
        ) : (
          <div className="library-empty-state">
            <h1>Meus Timbres</h1>
            <p>Salve o resumo de uma conversa para ele aparecer aqui.</p>
            <button className="timbre-nav-button is-active" type="button" onClick={() => navigate("/novo-timbre")}>
              <span aria-hidden="true">+</span>
              Novo Timbre
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function formatProjectTitle(project: TimbreProject) {
  return project.title.replace(/\.[a-z0-9]+ - Timbre$/i, " - Timbre");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getSettingsFromSummary(summary?: string) {
  if (!summary) {
    return [];
  }

  const [, rawSettings] = summary.split("Ajustes sugeridos:");
  if (!rawSettings) {
    return [];
  }

  return rawSettings
    .replace(/\.$/, "")
    .split(",")
    .map((setting) => setting.trim())
    .filter(Boolean);
}
