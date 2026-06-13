import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../../auth/service/auth-store";
import { equipmentService } from "../../service/equipment-service";
import { useEquipmentStore } from "../../service/equipment-store";
import type { Equipment } from "../../service/equipment-types";
import { Guitar, SlidersHorizontal, Plus, Settings2, Trash2 } from "lucide-react";
import { Topbar } from "../../../../commons/components/Topbar";

export function EquipmentsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const addPersistedEquipment = useEquipmentStore((state) => state.addPersistedEquipment);
  const updateEquipment = useEquipmentStore((state) => state.updateEquipment);
  const removeEquipment = useEquipmentStore((state) => state.removeEquipment);

  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados do Formulário no Modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [instrumentType, setInstrumentType] = useState<"Guitarra" | "Baixo" | "Violão">("Guitarra");
  const [instBrand, setInstBrand] = useState("");
  const [instModel, setInstModel] = useState("");
  const [amps, setAmps] = useState<Array<{ brand: string; model: string }>>([{ brand: "", model: "" }]);
  const [pedals, setPedals] = useState<string[]>([""]);
  const [daws, setDaws] = useState<string[]>([""]);

  useEffect(() => {
    if (!user) {
      return;
    }

    equipmentService
      .listByUser(user.id)
      .then(setEquipments)
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : "Não foi possível carregar seus equipamentos.");
      });
  }, [setEquipments, user]);

  function openCreateModal() {
    setEditingId(null);
    setProfileName("Novo Setup");
    setInstrumentType("Guitarra");
    setInstBrand("");
    setInstModel("");
    setAmps([{ brand: "", model: "" }]);
    setPedals([""]);
    setDaws([""]);
    setFeedback("");
    setModalOpen(true);
  }

  function openEditModal(eq: Equipment) {
    setEditingId(eq.id);
    setProfileName(eq.profileName);
    setInstrumentType(eq.instrumentType);
    setInstBrand(eq.instrument.brand);
    setInstModel(eq.instrument.model);
    setAmps(eq.amps.length > 0 ? eq.amps : [{ brand: "", model: "" }]);
    setPedals(eq.pedals.length > 0 ? eq.pedals : [""]);
    setDaws(eq.daws && eq.daws.length > 0 ? eq.daws : [""]);
    setFeedback("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFeedback("");
  }

  // Manipulação de inputs dinâmicos
  const handleAddAmp = () => setAmps([...amps, { brand: "", model: "" }]);
  const handleRemoveAmp = (index: number) => {
    if (amps.length > 1) setAmps(amps.filter((_, i) => i !== index));
  };
  const handleAmpChange = (index: number, field: "brand" | "model", value: string) => {
    setAmps(amps.map((amp, i) => (i === index ? { ...amp, [field]: value } : amp)));
  };

  const handleAddPedal = () => setPedals([...pedals, ""]);
  const handleRemovePedal = (index: number) => {
    if (pedals.length > 1) setPedals(pedals.filter((_, i) => i !== index));
  };
  const handlePedalChange = (index: number, value: string) => {
    setPedals(pedals.map((pedal, i) => (i === index ? value : pedal)));
  };

  const handleAddDaw = () => setDaws([...daws, ""]);
  const handleRemoveDaw = (index: number) => {
    if (daws.length > 1) setDaws(daws.filter((_, i) => i !== index));
  };
  const handleDawChange = (index: number, value: string) => {
    setDaws(daws.map((daw, i) => (i === index ? value : daw)));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (!profileName.trim()) {
      setFeedback("O nome do perfil é obrigatório.");
      return;
    }

    if (!instBrand.trim() || !instModel.trim()) {
      setFeedback("O instrumento precisa de marca e modelo.");
      return;
    }

    const activeAmps = amps.filter((amp) => amp.brand.trim() !== "" && amp.model.trim() !== "");
    if (activeAmps.length === 0) {
      setFeedback("Adicione pelo menos um amplificador completo.");
      return;
    }

    const activePedals = pedals.map((p) => p.trim()).filter((p) => p !== "");
    if (activePedals.length === 0) {
      setFeedback("Adicione pelo menos um pedal.");
      return;
    }

    const activeDaws = daws.map((d) => d.trim()).filter((d) => d !== "");

    setLoading(true);

    const payload = {
      profileName: profileName.trim(),
      instrumentType,
      instrument: { brand: instBrand.trim(), model: instModel.trim() },
      amps: activeAmps,
      pedals: activePedals,
      daws: activeDaws.length > 0 ? activeDaws : undefined,
    };

    try {
      if (editingId) {
        const updated = await equipmentService.update({ id: editingId, ...payload });
        updateEquipment(updated);
      } else {
        const created = await equipmentService.create(payload);
        addPersistedEquipment(created);
      }
      closeModal();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o setup.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveSetup() {
    if (!editingId) return;

    if (!window.confirm("Tem certeza que deseja remover este perfil de setup?")) {
      return;
    }

    setLoading(true);
    try {
      await equipmentService.remove(editingId);
      removeEquipment(editingId);
      closeModal();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível remover o setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <Topbar activeTab="equipamentos" />

      <section className="equipment-page" style={{ padding: "0 0 2rem" }}>
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Meu setup</p>
            <h1>Perfis de Setup</h1>
          </div>
          <button className="primary-button compact" onClick={openCreateModal}>
            <Plus size={17} /> Criar Perfil de Setup
          </button>
        </div>

        {equipments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.7)", borderRadius: "24px", border: "1px solid var(--line)" }}>
            <h2 style={{ color: "var(--primary)" }}>Nenhum setup configurado</h2>
            <p style={{ color: "var(--muted)", maxWidth: "400px", margin: "0 auto 1.5rem" }}>Crie seu primeiro perfil de setup com instrumento, pedais e amplificadores para realizar análises de timbre.</p>
            <button className="primary-button" onClick={openCreateModal}>Começar cadastro</button>
          </div>
        ) : (
          <div className="equipment-grid">
            {equipments.map((eq) => (
              <div className="equipment-card" key={eq.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h2>{eq.profileName}</h2>
                    <button
                      onClick={() => openEditModal(eq)}
                      style={{ background: "transparent", border: 0, color: "var(--primary)", cursor: "pointer" }}
                    >
                      <Settings2 size={19} />
                    </button>
                  </div>
                  <p className="eyebrow" style={{ marginTop: "0.2rem" }}>{eq.instrumentType}</p>

                  <div className="equipment-row" style={{ marginTop: "1rem" }}>
                    <Guitar size={18} style={{ color: "var(--primary)" }} />
                    <span>Instrumento: {eq.instrument.brand} {eq.instrument.model}</span>
                  </div>

                  <div className="equipment-row">
                    <SlidersHorizontal size={18} style={{ color: "var(--primary)" }} />
                    <span>Amps: {eq.amps.map((a) => `${a.brand} ${a.model}`).join(", ")}</span>
                  </div>

                  {eq.pedals && eq.pedals.length > 0 && (
                    <div className="equipment-row">
                      <SlidersHorizontal size={18} style={{ color: "var(--primary)" }} />
                      <span>Pedais: {eq.pedals.join(", ")}</span>
                    </div>
                  )}

                  {eq.daws && eq.daws.length > 0 && (
                    <div className="equipment-row">
                      <SlidersHorizontal size={18} style={{ color: "var(--primary)" }} />
                      <span>DAW: {eq.daws.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 100 }}>
          <form className="equipment-modal" onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, color: "var(--primary)" }}>{editingId ? "Editar Setup" : "Novo Setup"}</h2>
              <button className="cancel-button" type="button" onClick={closeModal}>Cancelar</button>
            </div>

            <div className="responsive-grid-2" style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px", gap: "2rem" }}>
              {/* Coluna 1: Informações do Instrumento e DAWs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <label className="form-field">
                  <span>Nome do Perfil</span>
                  <input value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                </label>

                <div className="responsive-grid-3" style={{ gap: "10px" }}>
                  <label className="form-field">
                    <span>Tipo</span>
                    <select value={instrumentType} onChange={(e) => setInstrumentType(e.target.value as any)}>
                      <option value="Guitarra">Guitarra</option>
                      <option value="Baixo">Baixo</option>
                      <option value="Violão">Violão</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Marca</span>
                    <input value={instBrand} onChange={(e) => setInstBrand(e.target.value)} required />
                  </label>
                  <label className="form-field">
                    <span>Modelo</span>
                    <input value={instModel} onChange={(e) => setInstModel(e.target.value)} required />
                  </label>
                </div>

                {/* DAWs */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)" }}>DAWs (Opcional)</span>
                    <button type="button" onClick={handleAddDaw} style={{ background: "transparent", border: 0, color: "var(--primary)", fontSize: "0.8rem", fontWeight: 700 }}>+ Add</button>
                  </div>
                  {daws.map((daw, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <input style={{ flex: 1 }} value={daw} onChange={(e) => handleDawChange(idx, e.target.value)} placeholder="DAW" />
                      {daws.length > 1 && (
                        <button type="button" onClick={() => handleRemoveDaw(idx)} style={{ background: "transparent", border: 0, color: "var(--danger)" }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 2: Amplificadores e Pedais */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Amplificadores */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)" }}>Amplificadores</span>
                    <button type="button" onClick={handleAddAmp} style={{ background: "transparent", border: 0, color: "var(--primary)", fontSize: "0.8rem", fontWeight: 700 }}>+ Add</button>
                  </div>
                  {amps.map((amp, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <input style={{ flex: 1 }} value={amp.brand} onChange={(e) => handleAmpChange(idx, "brand", e.target.value)} placeholder="Marca" required />
                      <input style={{ flex: 1 }} value={amp.model} onChange={(e) => handleAmpChange(idx, "model", e.target.value)} placeholder="Modelo" required />
                      {amps.length > 1 && (
                        <button type="button" onClick={() => handleRemoveAmp(idx)} style={{ background: "transparent", border: 0, color: "var(--danger)" }}>×</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pedais */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)" }}>Pedais</span>
                    <button type="button" onClick={handleAddPedal} style={{ background: "transparent", border: 0, color: "var(--primary)", fontSize: "0.8rem", fontWeight: 700 }}>+ Add</button>
                  </div>
                  {pedals.map((pedal, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <input style={{ flex: 1 }} value={pedal} onChange={(e) => handlePedalChange(idx, e.target.value)} placeholder="Pedal" required />
                      {pedals.length > 1 && (
                        <button type="button" onClick={() => handleRemovePedal(idx)} style={{ background: "transparent", border: 0, color: "var(--danger)" }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {feedback && <p className="form-feedback" style={{ color: "var(--danger)" }}>{feedback}</p>}

            <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
              {editingId && (
                <button
                  type="button"
                  onClick={handleRemoveSetup}
                  disabled={loading}
                  style={{
                    background: "rgba(255, 88, 61, 0.1)",
                    border: "1px solid var(--danger)",
                    borderRadius: "12px",
                    color: "var(--danger)",
                    flex: 1,
                    height: "2.6rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Trash2 size={16} /> Excluir
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="primary-button"
                style={{ flex: 2, height: "2.6rem", borderRadius: "12px" }}
              >
                {loading ? "Processando..." : editingId ? "Atualizar Setup" : "Criar Setup"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
