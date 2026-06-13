import { FormEvent, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../../auth/service/auth-store";
import { equipmentService } from "../../../equipment/service/equipment-service";
import { useEquipmentStore } from "../../../equipment/service/equipment-store";
import { timbreService } from "../../service/timbre-service";
import { useTimbreStore } from "../../service/timbre-store";
import type { ChatMessage } from "../../service/timbre-types";
import { Topbar } from "../../../../commons/components/Topbar";
import { useCreditsStore } from "../../../auth/service/credits-store";
import {
  CloudUpload,
  Sparkles,
  ListMusic,
  Plus,
  Send,
  Paperclip,
  FileAudio,
  ArrowLeft
} from "lucide-react";

export function NewTimbrePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const saveProject = useTimbreStore((state) => state.saveProject);

  const [selectedEqId, setSelectedEqId] = useState<string>("");

  // Dados do alvo da análise
  const [targetArtist, setTargetArtist] = useState("");
  const [targetSong, setTargetSong] = useState("");
  const [targetInstrument, setTargetInstrument] = useState("");

  // Arquivo de áudio inicial
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [currentToneSimulation, setCurrentToneSimulation] = useState("");

  // Estados do Chat
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatAudioFile, setChatAudioFile] = useState<File | null>(null);

  // Checklist de ajustes recomendados
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    equipmentService
      .listByUser(user.id)
      .then((data) => {
        setEquipments(data);
        if (data.length > 0) {
          setSelectedEqId(data[0].id);
        }
      })
      .catch(() => {
        setFeedbackMsg("Não foi possível carregar seus setups.");
      });
  }, [setEquipments, user]);

  useEffect(() => {
    if (isChatActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatActive]);

  const selectedSetup = equipments.find((e) => e.id === selectedEqId);

  function handleAudioFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  }

  function handleChatAudioFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setChatAudioFile(file);
    }
  }

  // Primeiro Envio da Análise
  async function handleAnalyze(event: FormEvent) {
    event.preventDefault();
    setFeedbackMsg("");

    const credits = useCreditsStore.getState().credits;
    if (credits <= 0) {
      setFeedbackMsg("Você não possui créditos suficientes. Clique em 'Créditos' no topo para assinar um plano e obter mais.");
      return;
    }

    if (!selectedEqId) {
      setFeedbackMsg("Por favor, selecione ou crie um setup de equipamentos no menu lateral.");
      return;
    }

    if (!targetArtist.trim() || !targetSong.trim() || !targetInstrument.trim()) {
      setFeedbackMsg("Preencha todos os campos do timbre alvo (Artista, Música e Instrumento).");
      return;
    }

    if (!audioFile) {
      setFeedbackMsg("O upload de um áudio gravado do seu som atual é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      const result = await timbreService.generateFeedback({
        equipmentId: Number(selectedEqId),
        targetArtist: targetArtist.trim(),
        targetSong: targetSong.trim(),
        targetInstrument: targetInstrument.trim(),
        audio: audioFile,
        currentToneSimulation: currentToneSimulation.trim() || undefined,
      });

      useCreditsStore.getState().spendCredit();

      const userMsgId = crypto.randomUUID();
      const assistantMsgId = crypto.randomUUID();

      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        text: currentToneSimulation.trim() || undefined,
        audioName: audioFile.name,
        createdAt: new Date().toISOString(),
      };

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        analysisSummary: result.analysisSummary,
        adjustments: result.adjustments,
        missingElements: result.missingElements,
        createdAt: new Date().toISOString(),
      };

      setChatMessages([userMsg, assistantMsg]);
      setIsChatActive(true);
    } catch (error) {
      setFeedbackMsg(error instanceof Error ? error.message : "Não foi possível realizar a análise.");
    } finally {
      setLoading(false);
    }
  }

  // Envio de nova iteração no chat
  async function handleSendChatMessage(event: FormEvent) {
    event.preventDefault();
    if (!chatText.trim() && !chatAudioFile) return;

    setFeedbackMsg("");
    setLoading(true);

    const userMsgId = crypto.randomUUID();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: chatText.trim() || undefined,
      audioName: chatAudioFile?.name,
      createdAt: new Date().toISOString(),
    };

    // Adiciona a mensagem do usuário imediatamente na tela
    const updatedMessages = [...chatMessages, newUserMsg];
    setChatMessages(updatedMessages);

    // Salva o texto enviado para limpar o campo
    const textToSend = chatText.trim();
    setChatText("");
    const fileToSend = chatAudioFile;
    setChatAudioFile(null);

    try {
      // Constrói o histórico da conversa para o prompt complementar
      const historyString = updatedMessages
        .map((msg) => {
          if (msg.role === "user") {
            return `[Usuário]: ${msg.text || ""}${msg.audioName ? ` (Áudio enviado: ${msg.audioName})` : ""}`;
          } else {
            return `[IA LoopTone]: ${msg.analysisSummary}\nAjustes sugeridos: ${(msg.adjustments ?? []).join(", ")}\nSugestões: ${(msg.missingElements ?? []).join(", ")}`;
          }
        })
        .join("\n\n");

      const currentToneSimulationText = `HISTÓRICO DA CONVERSA:\n${historyString}\n\nNOVA INTERAÇÃO DO USUÁRIO:\n${textToSend || "Análise do novo áudio enviado."}`;

      const result = await timbreService.generateFeedback({
        equipmentId: Number(selectedEqId),
        targetArtist: targetArtist.trim(),
        targetSong: targetSong.trim(),
        targetInstrument: targetInstrument.trim(),
        audio: fileToSend || audioFile!, // Envia o novo áudio ou o primeiro se não houver um novo
        currentToneSimulation: currentToneSimulationText,
      });

      const assistantMsgId = crypto.randomUUID();
      const newAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        analysisSummary: result.analysisSummary,
        adjustments: result.adjustments,
        missingElements: result.missingElements,
        createdAt: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, newAssistantMsg]);
    } catch (error) {
      setFeedbackMsg(error instanceof Error ? error.message : "Erro ao enviar mensagem.");
      // Se deu erro, remove a última mensagem do usuário para permitir tentar de novo
      setChatMessages((prev) => prev.filter((m) => m.id !== userMsgId));
      setChatText(textToSend);
      setChatAudioFile(fileToSend);
    } finally {
      setLoading(false);
    }
  }

  // Persiste a sessão de chat completa no localStorage
  function handleSaveProject() {
    if (chatMessages.length === 0) return;

    // Acha a última resposta do assistente para salvar como resumo do preset
    const assistantMsgs = chatMessages.filter((m) => m.role === "assistant");
    const latestAssistant = assistantMsgs[assistantMsgs.length - 1];

    try {
      const now = new Date().toISOString();
      const title = `${targetSong} - Timbre`;

      const project = {
        id: crypto.randomUUID(),
        title,
        artist: targetArtist.trim(),
        song: targetSong.trim(),
        instrument: targetInstrument.trim(),
        equipmentId: selectedEqId,
        analysisSummary: latestAssistant?.analysisSummary || "Análise de chat em andamento.",
        adjustments: latestAssistant?.adjustments || [],
        missingElements: latestAssistant?.missingElements || [],
        messages: chatMessages, // Histórico completo do chat
        createdAt: now,
        updatedAt: now,
      };

      saveProject(project);
      setFeedbackMsg("Histórico de timbre salvo com sucesso em 'Meus Timbres'!");
    } catch {
      setFeedbackMsg("Erro ao salvar a análise.");
    }
  }

  function handleResetChat() {
    if (confirm("Deseja realmente iniciar uma nova conversa e limpar esta sessão?")) {
      setIsChatActive(false);
      setChatMessages([]);
      setAudioFile(null);
      setChatAudioFile(null);
      setChatText("");
      setCurrentToneSimulation("");
      setFeedbackMsg("");
      setCheckedItems({});
    }
  }

  const handleToggleChecked = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="app-shell">
      <Topbar activeTab="novo-timbre" />

      <section className="workbench-layout">
        <aside className="sidebar-card">
          <div className="sidebar-title">
            <span>Selecione o Setup</span>
            <ListMusic size={18} />
          </div>

          {equipments.length === 0 ? (
            <div style={{ padding: "1rem 0" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 1rem" }}>Nenhum setup cadastrado.</p>
              <button className="primary-button compact" onClick={() => navigate("/equipamentos")} style={{ width: "100%" }}>
                <Plus size={16} /> Criar Setup
              </button>
            </div>
          ) : (
            <div className="tone-list" style={{ marginBottom: "1.5rem" }}>
              {equipments.map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  className={selectedEqId === eq.id ? "tone-item active" : "tone-item"}
                  disabled={isChatActive}
                  onClick={() => {
                    setSelectedEqId(eq.id);
                  }}
                  style={{ opacity: isChatActive ? 0.7 : 1 }}
                >
                  <span /> {eq.profileName}
                </button>
              ))}
            </div>
          )}

          {selectedSetup && (
            <div className="sidebar-setup" style={{ display: "grid", gap: "8px" }}>
              <div className="section-title-row small">
                <span>Setup Atual</span>
              </div>
              <div className="setup-info-group">
                <label>Instrumento</label>
                <div>{selectedSetup.instrument?.brand} {selectedSetup.instrument?.model} ({selectedSetup.instrumentType})</div>
              </div>
              <div className="setup-info-group">
                <label>Amplificador</label>
                <div>{(selectedSetup.amps ?? []).map((a) => `${a.brand} ${a.model}`).join(", ") || "Nenhum"}</div>
              </div>
              <div className="setup-info-group">
                <label>Pedais</label>
                <div>{(selectedSetup.pedals ?? []).join(", ") || "Nenhum"}</div>
              </div>
            </div>
          )}
        </aside>

        <article className="workspace-card">
          {!isChatActive ? (
            // Formulário de Configuração Inicial
            <div>
              <p className="eyebrow">Nova análise de timbre com IA</p>
              <h1 style={{ fontSize: "2rem", margin: "0 0 1.5rem" }}>
                {targetSong ? `${targetSong} - ${targetArtist}` : "Selecione o Som Alvo"}
              </h1>

              <form onSubmit={handleAnalyze} style={{ display: "grid", gap: "0.8rem" }}>
                <div className="responsive-grid-3">
                  <label className="form-field">
                    <span>Artista Alvo</span>
                    <input
                      value={targetArtist}
                      onChange={(e) => setTargetArtist(e.target.value)}
                      placeholder="Ex: Slash, David Gilmour"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Música Alvo</span>
                    <input
                      value={targetSong}
                      onChange={(e) => setTargetSong(e.target.value)}
                      placeholder="Ex: Sweet Child O' Mine"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Instrumento Alvo</span>
                    <input
                      value={targetInstrument}
                      onChange={(e) => setTargetInstrument(e.target.value)}
                      placeholder="Ex: Guitarra Solo, Baixo"
                      required
                    />
                  </label>
                </div>

                {/* Upload de áudio atual */}
                <div className="upload-grid" style={{ margin: 0 }}>
                  <input
                    type="file"
                    id="audio-input"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="upload-box"
                    onClick={() => document.getElementById("audio-input")?.click()}
                    style={{
                      cursor: "pointer",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px"
                    }}
                  >
                    <span style={{
                      display: "inline-flex",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--surface-soft)",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)",
                      flexShrink: 0
                    }}>
                      <CloudUpload size={18} />
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-start" }}>
                      <strong>Fazer upload do seu áudio inicial</strong>
                      <p>{audioFile ? `Selecionado: ${audioFile.name}` : "Selecione um arquivo de gravação .mp3 ou .wav"}</p>
                    </div>
                  </button>
                </div>

                {/* Observações */}
                <div className="message-box" style={{ padding: "0.5rem", borderRadius: "20px", marginTop: 0 }}>
                  <textarea
                    style={{ width: "100%", outline: "none", resize: "none" }}
                    value={currentToneSimulation}
                    onChange={(e) => setCurrentToneSimulation(e.target.value)}
                    placeholder="Adicione uma observação sobre o seu som atual (Ex: 'Acho que está muito agudo', etc)..."
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                  style={{ padding: "10px 20px", borderRadius: "12px", alignSelf: "start", fontSize: "0.95rem", height: "auto" }}
                >
                  <Sparkles size={18} /> {loading ? "Analisando com Gemini..." : "Começar análise de timbre"}
                </button>
              </form>
            </div>
          ) : (
            // Chat de Feedback Ativo
            <div className="chat-container">
              <div className="chat-header">
                <div>
                  <span className="eyebrow" style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>Melhorando Timbre</span>
                  <h3>{targetSong} - {targetArtist} ({targetInstrument})</h3>
                </div>
                <button
                  onClick={handleResetChat}
                  style={{
                    background: "rgba(255, 88, 61, 0.1)",
                    border: 0,
                    borderRadius: "12px",
                    color: "var(--danger)",
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <ArrowLeft size={14} /> Novo Alvo
                </button>
              </div>

              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-bubble ${msg.role}`}>
                    {msg.role === "user" && msg.audioName && (
                      <div className="chat-bubble-audio">
                        <FileAudio size={16} />
                        <span>{msg.audioName}</span>
                      </div>
                    )}
                    {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}

                    {msg.role === "assistant" && (
                      <div>
                        <p style={{ margin: "0 0 12px" }}>{msg.analysisSummary}</p>

                        {msg.adjustments && msg.adjustments.length > 0 && (
                          <>
                            <h4>Ajustes Recomendados no Setup:</h4>
                            <div className="chat-adjustments-checklist">
                              {msg.adjustments.map((adj, idx) => {
                                const itemKey = `${msg.id}-${idx}`;
                                return (
                                  <label key={idx} className="chat-adjustment-item">
                                    <input
                                      type="checkbox"
                                      checked={!!checkedItems[itemKey]}
                                      onChange={() => handleToggleChecked(itemKey)}
                                    />
                                    <span className={checkedItems[itemKey] ? "checked" : ""}>
                                      {adj}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {msg.missingElements && msg.missingElements.length > 0 && (
                          <>
                            <h4 style={{ marginTop: "1rem" }}>Elementos Ausentes / DAW:</h4>
                            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--muted)" }}>
                              {msg.missingElements.map((el, idx) => (
                                <li key={idx} style={{ marginBottom: "4px" }}>{el}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="chat-bubble assistant" style={{ fontStyle: "italic", color: "var(--muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={16} className="animate-pulse" />
                    <span>Gemini analisando novo áudio...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendChatMessage} className="chat-input-container">
                <div className="chat-input-row">
                  <textarea
                    className="chat-textarea"
                    placeholder="O que você ajustou? Envie uma nova gravação do timbre modificado ou tire dúvidas..."
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage(e);
                      }
                    }}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="primary-button compact"
                    disabled={loading || (!chatText.trim() && !chatAudioFile)}
                    style={{ height: "48px", width: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >
                    <Send size={18} />
                  </button>
                </div>

                <div className="chat-input-actions">
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="file"
                      id="chat-audio-input"
                      accept="audio/*"
                      onChange={handleChatAudioFileChange}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("chat-audio-input")?.click()}
                      className="ghost-button"
                      style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: "18px", display: "flex", alignItems: "center", gap: "6px" }}
                      disabled={loading}
                    >
                      <Paperclip size={14} /> Anexar Novo Áudio
                    </button>

                    {chatAudioFile && (
                      <div className="chat-upload-indicator">
                        <FileAudio size={14} />
                        <span>{chatAudioFile.name}</span>
                        <button type="button" onClick={() => setChatAudioFile(null)}>×</button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProject}
                    className="ghost-button"
                    style={{ padding: "6px 16px", fontSize: "0.85rem", borderRadius: "18px", borderColor: "var(--primary-2)", color: "var(--primary-2)" }}
                    disabled={loading}
                  >
                    Salvar em Meus Timbres
                  </button>
                </div>
              </form>
            </div>
          )}

          {feedbackMsg && (
            <p style={{ marginTop: "1rem", color: "var(--primary)", fontWeight: 700 }}>{feedbackMsg}</p>
          )}
        </article>
      </section>
    </main>
  );
}
