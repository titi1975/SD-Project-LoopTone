import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LoopToneLogo } from "../../../../commons/components/LoopToneLogo";
import { useAuthStore } from "../../../auth/service/auth-store";
import { equipmentService } from "../../../equipment/service/equipment-service";
import { useEquipmentStore } from "../../../equipment/service/equipment-store";
import { timbreService } from "../../service/timbre-service";
import { useTimbreStore } from "../../service/timbre-store";
import type { TimbreChatMessage } from "../../service/timbre-types";

const defaultReferenceAudios: string[] = [];

export function NewTimbrePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const messages = useTimbreStore((state) => state.messages);
  const addMessage = useTimbreStore((state) => state.addMessage);
  const draftSummary = useTimbreStore((state) => state.draftSummary);
  const setDraftSummary = useTimbreStore((state) => state.setDraftSummary);
  const saveProject = useTimbreStore((state) => state.saveProject);
  const resetChat = useTimbreStore((state) => state.resetChat);

  const [prompt, setPrompt] = useState("");
  const [referenceAudios, setReferenceAudios] = useState(defaultReferenceAudios);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sessionEquipmentIds, setSessionEquipmentIds] = useState<string[]>([]);
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);

  const sessionEquipments = useMemo(() => 
    equipments.filter(e => sessionEquipmentIds.includes(e.id))
  , [equipments, sessionEquipmentIds]);

  const equipmentNames = useMemo(() => sessionEquipments.map((equipment) => equipment.name), [sessionEquipments]);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (!user) {
      return;
    }

    equipmentService
      .listByUser(user.id)
      .then((data) => {
        setEquipments(data);
        setSessionEquipmentIds((current) => (current.length === 0 ? data.map((e) => e.id) : current));
      })
      .catch(() => {
        setFeedback("Nao foi possivel atualizar seu setup agora. Mantive os equipamentos salvos neste navegador.");
      });
  }, [setEquipments, user]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPrompt = prompt.trim();
    if (normalizedPrompt.length < 6) {
      setFeedback("Descreva o timbre com um pouco mais de detalhe.");
      return;
    }

    const userMessage: TimbreChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: normalizedPrompt,
      createdAt: new Date().toISOString(),
    };

    setFeedback("");
    setLoading(true);
    addMessage(userMessage);
    setPrompt("");

    try {
      const response = await timbreService.sendChatMessage({
        userId: user?.id,
        prompt: normalizedPrompt,
        equipmentNames,
        referenceAudioNames: referenceAudios,
        previousMessages: [...messages, userMessage],
      });

      addMessage(response.message);
      setDraftSummary(response.summary);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel gerar uma response para este timbre.");
    } finally {
      setLoading(false);
    }
  }

  function handleAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setReferenceAudios([file.name]);
    }
  }

  function removeReferenceAudio(audio: string) {
    setReferenceAudios((current) => current.filter((a) => a !== audio));
  }

  function toggleEquipmentSelection(id: string) {
    setSessionEquipmentIds(current => 
      current.includes(id) 
        ? current.filter(itemId => itemId !== id)
        : [...current, id]
    );
  }

  async function handleSaveSummary() {
    if (!draftSummary) {
      setFeedback("Converse sobre o timbre antes de salvar o resumo.");
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const project = {
        id: crypto.randomUUID(),
        title: referenceAudios[0] ? `${referenceAudios[0]} - Timbre` : "Novo Timbre",
        summary: draftSummary,
        createdAt: now,
        updatedAt: now,
      };

      const savedProject = await timbreService.saveProject(project);
      saveProject(savedProject);
      setFeedback("Resumo salvo em Meus Timbres.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar o resumo.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewTimbre() {
    resetChat();
    setPrompt("");
    setFeedback("");
  }

  return (
    <main className={`timbre-workspace ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <header className="timbre-topbar">
        <LoopToneLogo size="sm" />
        <nav className="timbre-nav" aria-label="Navegacao principal">
          <button className="timbre-nav-button is-active" type="button" onClick={handleNewTimbre}>
            <span aria-hidden="true">+</span>
            Novo Timbre
          </button>
          <button className="timbre-nav-button" type="button" onClick={() => navigate("/meus-timbres")}>
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

      <aside className={`timbre-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
        {!isSidebarCollapsed && (
          <>
            <section className="sidebar-section">
              <div className="sidebar-title-row">
                <h2>Audio Referencia</h2>
                <button type="button" onClick={() => setIsSidebarCollapsed(true)} aria-label="Recolher sidebar">
                  <span aria-hidden="true">[]</span>
                </button>
              </div>

              <div className="reference-input-row">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  style={{ display: "none" }}
                  onChange={handleAudioUpload}
                />
                <button 
                  className="upload-trigger" 
                  type="button" 
                  onClick={() => document.getElementById("audio-upload")?.click()}
                >
                  Fazer upload de áudio
                </button>
              </div>

              <div className="sidebar-chip-list">
                {referenceAudios.map((audio) => (
                  <div className="sidebar-chip with-dot" key={audio}>
                    <span className="chip-text">{audio}</span>
                    <button className="chip-delete" type="button" onClick={() => removeReferenceAudio(audio)}>×</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="sidebar-section">
              <div className="sidebar-title-row">
                <h2>Setup Atual</h2>
                <button type="button" onClick={() => setIsLinkingModalOpen(true)}>
                  Editar na sessao
                </button>
              </div>

              <div className="sidebar-chip-list">
                {equipmentNames.length === 0 ? (
                  <button className="sidebar-chip" type="button" onClick={() => setIsLinkingModalOpen(true)}>
                    Adicionar setup
                  </button>
                ) : (
                  sessionEquipments.map((equipment) => (
                    <div className="sidebar-chip" key={equipment.id}>
                      <span className="chip-text">{equipment.name}</span>
                      <button className="chip-delete" type="button" onClick={() => toggleEquipmentSelection(equipment.id)}>×</button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
        {isSidebarCollapsed && (
          <button className="expand-sidebar-button" type="button" onClick={() => setIsSidebarCollapsed(false)}>
             []
          </button>
        )}
      </aside>

      <section className="timbre-chat-panel" aria-label="Conversa de criacao de timbre">
        <div className="timbre-chat-scroll">
          {!hasMessages ? (
            <div className="timbre-empty-state">
              <h1>Descreva o timbre que deseja atingir</h1>
            </div>
          ) : (
            <div className="chat-message-list">
              {messages.map((message) => (
                <article className={`chat-message ${message.role === "user" ? "is-user" : "is-assistant"}`} key={message.id}>
                  <p>{message.content}</p>
                  {message.settings && (
                    <div className="setting-chip-grid">
                      {message.settings.map((setting) => (
                        <span key={setting}>{setting}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <form className="timbre-composer" onSubmit={handleSendMessage}>
          <textarea
            aria-label="Descreva o timbre"
            placeholder="Ex: Quero chegar em um timbre de solo encorpado, com sustain e medios presentes..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />

          <div className="composer-actions">
            <button className="action-icon-button" type="button" title="Usar microfone">🎤</button>
            <button className="action-icon-button" type="button" title="Fazer upload de timbre">📁</button>
            <div className="spacer" />
            <button className="save-summary-button" type="button" onClick={handleSaveSummary}>
              Salvar resumo do timbre
            </button>
            <button className="send-button" type="submit" disabled={loading} aria-label="Enviar mensagem">
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </form>

        {feedback && <p className="timbre-feedback">{feedback}</p>}
      </section>

      {isLinkingModalOpen && (
        <div className="modal-backdrop">
          <div className="equipment-modal linking-modal" role="dialog" aria-modal="true" aria-labelledby="linking-modal-title">
            <div className="modal-header">
              <h2 id="linking-modal-title">Selecionar Equipamentos</h2>
              <button className="cancel-button" type="button" onClick={() => setIsLinkingModalOpen(false)}>
                Fechar
              </button>
            </div>
            
            <div className="equipment-selection-list">
              {equipments.length === 0 ? (
                <p>Nenhum equipamento cadastrado. <button type="button" onClick={() => navigate("/setup")}>Ir para Meus Equipamentos</button></p>
              ) : (
                equipments.map((equipment) => (
                  <label key={equipment.id} className="selection-item">
                    <input 
                      type="checkbox" 
                      checked={sessionEquipmentIds.includes(equipment.id)}
                      onChange={() => toggleEquipmentSelection(equipment.id)}
                    />
                    <span>{equipment.name}</span>
                    <small>{equipment.category}</small>
                  </label>
                ))
              )}
            </div>

            <button className="modal-primary" type="button" onClick={() => setIsLinkingModalOpen(false)}>
              Concluir Seleção
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
