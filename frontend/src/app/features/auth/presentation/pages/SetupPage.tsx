import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { useAuthStore } from "../../service/auth-store";
import { equipmentService } from "../../../equipment/service/equipment-service";
import { useEquipmentStore } from "../../../equipment/service/equipment-store";
import { AuthShell } from "../components/AuthShell";
import { AuthStepper } from "../components/AuthStepper";

export function SetupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addPersistedEquipment = useEquipmentStore((state) => state.addPersistedEquipment);

  const [profileName, setProfileName] = useState("Meu Setup Principal");
  const [instrumentType, setInstrumentType] = useState<"Guitarra" | "Baixo" | "Violão">("Guitarra");
  const [instBrand, setInstBrand] = useState("");
  const [instModel, setInstModel] = useState("");

  const [amps, setAmps] = useState<Array<{ brand: string; model: string }>>([{ brand: "", model: "" }]);
  const [pedals, setPedals] = useState<string[]>([""]);
  const [daws, setDaws] = useState<string[]>([""]);
  
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Manipulação de Amps
  const handleAddAmp = () => setAmps([...amps, { brand: "", model: "" }]);
  const handleRemoveAmp = (index: number) => {
    if (amps.length > 1) {
      setAmps(amps.filter((_, i) => i !== index));
    }
  };
  const handleAmpChange = (index: number, field: "brand" | "model", value: string) => {
    const updated = amps.map((amp, i) => (i === index ? { ...amp, [field]: value } : amp));
    setAmps(updated);
  };

  // Manipulação de Pedais
  const handleAddPedal = () => setPedals([...pedals, ""]);
  const handleRemovePedal = (index: number) => {
    if (pedals.length > 1) {
      setPedals(pedals.filter((_, i) => i !== index));
    }
  };
  const handlePedalChange = (index: number, value: string) => {
    setPedals(pedals.map((pedal, i) => (i === index ? value : pedal)));
  };

  // Manipulação de DAWs
  const handleAddDaw = () => setDaws([...daws, ""]);
  const handleRemoveDaw = (index: number) => {
    if (daws.length > 1) {
      setDaws(daws.filter((_, i) => i !== index));
    }
  };
  const handleDawChange = (index: number, value: string) => {
    setDaws(daws.map((daw, i) => (i === index ? value : daw)));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (!profileName.trim()) {
      setFeedback("Dê um nome para o seu perfil de setup.");
      return;
    }

    if (!instBrand.trim() || !instModel.trim()) {
      setFeedback("Informe a marca e modelo do seu instrumento.");
      return;
    }

    // Filtrar vazios
    const activeAmps = amps.filter((amp) => amp.brand.trim() !== "" && amp.model.trim() !== "");
    if (activeAmps.length === 0) {
      setFeedback("Adicione pelo menos um amplificador (marca e modelo).");
      return;
    }

    const activePedals = pedals.map((p) => p.trim()).filter((p) => p !== "");
    if (activePedals.length === 0) {
      setFeedback("Adicione pelo menos um pedal na lista.");
      return;
    }

    const activeDaws = daws.map((d) => d.trim()).filter((d) => d !== "");

    setLoading(true);

    const payload = {
      profileName: profileName.trim(),
      instrumentType,
      instrument: {
        brand: instBrand.trim(),
        model: instModel.trim(),
      },
      amps: activeAmps.map((amp) => ({ brand: amp.brand.trim(), model: amp.model.trim() })),
      pedals: activePedals,
      daws: activeDaws.length > 0 ? activeDaws : undefined,
    };

    try {
      if (user) {
        const createdSetup = await equipmentService.create(payload);
        addPersistedEquipment(createdSetup);
      }
      navigate("/concluido");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível criar o setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthStepper activeStep={2} />
      <form className="register-card" onSubmit={handleSubmit} style={{ width: "min(100%, 650px)", padding: "2rem" }}>
        <h1 style={{ color: "var(--primary, #5a22d6)", margin: "0 0 1rem", fontSize: "1.8rem" }}>Seu primeiro Setup de Equipamentos</h1>
        <p style={{ color: "var(--muted, #6e6984)", margin: "0 0 2rem" }}>Cadastre seu setup básico. Você poderá criar outros perfis de equipamentos depois.</p>

        {/* Nome do Perfil */}
        <label className="form-field" style={{ marginBottom: "1.2rem" }}>
          <span>Nome do Perfil de Setup</span>
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Ex: Meu Setup Principal, Rock Solo, etc."
            required
          />
        </label>

        {/* Instrumento */}
        <div className="responsive-grid-3" style={{ marginBottom: "1.5rem" }}>
          <label className="form-field">
            <span>Tipo de Instrumento</span>
            <select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value as any)}
            >
              <option value="Guitarra">Guitarra</option>
              <option value="Baixo">Baixo</option>
              <option value="Violão">Violão</option>
            </select>
          </label>
          <label className="form-field">
            <span>Marca do Instrumento</span>
            <input
              value={instBrand}
              onChange={(e) => setInstBrand(e.target.value)}
              placeholder="Ex: Fender, Gibson"
              required
            />
          </label>
          <label className="form-field">
            <span>Modelo do Instrumento</span>
            <input
              value={instModel}
              onChange={(e) => setInstModel(e.target.value)}
              placeholder="Ex: Stratocaster, Les Paul"
              required
            />
          </label>
        </div>

        {/* Amplificadores */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "#8580b6", fontSize: "0.9rem", fontWeight: 800 }}>Amplificadores</span>
            <button
              type="button"
              onClick={handleAddAmp}
              style={{ background: "transparent", border: 0, color: "#7f58ff", fontWeight: 700, fontSize: "0.85rem" }}
            >
              + Adicionar Amp
            </button>
          </div>
          {amps.map((amp, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                style={{ flex: 1 }}
                value={amp.brand}
                onChange={(e) => handleAmpChange(index, "brand", e.target.value)}
                placeholder="Marca (Ex: Marshall)"
                required
              />
              <input
                style={{ flex: 1 }}
                value={amp.model}
                onChange={(e) => handleAmpChange(index, "model", e.target.value)}
                placeholder="Modelo (Ex: DSL40CR)"
                required
              />
              {amps.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAmp(index)}
                  style={{ background: "transparent", border: 0, color: "#ff583d", fontSize: "1.2rem" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pedais */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "#8580b6", fontSize: "0.9rem", fontWeight: 800 }}>Pedais e Efeitos</span>
            <button
              type="button"
              onClick={handleAddPedal}
              style={{ background: "transparent", border: 0, color: "#7f58ff", fontWeight: 700, fontSize: "0.85rem" }}
            >
              + Adicionar Pedal
            </button>
          </div>
          {pedals.map((pedal, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                style={{ flex: 1 }}
                value={pedal}
                onChange={(e) => handlePedalChange(index, e.target.value)}
                placeholder="Ex: Boss DS-1, Tube Screamer"
                required
              />
              {pedals.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePedal(index)}
                  style={{ background: "transparent", border: 0, color: "#ff583d", fontSize: "1.2rem" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* DAWs */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "#8580b6", fontSize: "0.9rem", fontWeight: 800 }}>DAWs e Softwares (Opcional)</span>
            <button
              type="button"
              onClick={handleAddDaw}
              style={{ background: "transparent", border: 0, color: "#7f58ff", fontWeight: 700, fontSize: "0.85rem" }}
            >
              + Adicionar DAW
            </button>
          </div>
          {daws.map((daw, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                style={{ flex: 1 }}
                value={daw}
                onChange={(e) => handleDawChange(index, e.target.value)}
                placeholder="Ex: Reaper, Logic Pro"
              />
              {daws.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDaw(index)}
                  style={{ background: "transparent", border: 0, color: "#ff583d", fontSize: "1.2rem" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {feedback && <p className="form-feedback" style={{ color: "var(--danger, #ff583d)", marginBottom: "1rem" }}>{feedback}</p>}

        <PrimaryButton disabled={loading} type="submit" style={{ width: "100%", marginTop: "1rem" }}>
          {loading ? "Salvando setup..." : "Salvar Setup e Concluir"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
