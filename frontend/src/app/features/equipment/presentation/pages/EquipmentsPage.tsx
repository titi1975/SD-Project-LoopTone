import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LoopToneLogo } from "../../../../commons/components/LoopToneLogo";
import { useAuthStore } from "../../../auth/service/auth-store";
import { equipmentService } from "../../service/equipment-service";
import { groupEquipmentsByCategory, useEquipmentStore } from "../../service/equipment-store";
import { equipmentCategories, type Equipment, type EquipmentCategory } from "../../service/equipment-types";

type EquipmentForm = {
  id?: string;
  name: string;
  category: EquipmentCategory;
};

const initialForm: EquipmentForm = {
  name: "",
  category: "Instrumentos",
};

const categoryLabels: Record<EquipmentCategory, string> = {
  Instrumentos: "Instrumentos",
  "Pedais e Efeitos": "Pedais e Efeitos",
  Amplificadores: "Amplificadores",
  "DAW / Software": "Daw/Software",
  "Interface de Audio": "Interface de Audio",
  Outros: "Outros",
};

export function EquipmentsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const addEquipment = useEquipmentStore((state) => state.addEquipment);
  const addPersistedEquipment = useEquipmentStore((state) => state.addPersistedEquipment);
  const updateEquipment = useEquipmentStore((state) => state.updateEquipment);
  const removeEquipment = useEquipmentStore((state) => state.removeEquipment);

  const groupedEquipments = useMemo(() => groupEquipmentsByCategory(equipments), [equipments]);
  const visibleCategories = useMemo(
    () => equipmentCategories.filter((category) => groupedEquipments[category].length > 0),
    [groupedEquipments],
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EquipmentForm>(initialForm);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    equipmentService
      .listByUser(user.id)
      .then(setEquipments)
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : "Nao foi possivel carregar seus equipamentos.");
      });
  }, [setEquipments, user]);

  function openCreateModal() {
    setForm(initialForm);
    setFeedback("");
    setModalOpen(true);
  }

  function openEditModal(equipment: Equipment) {
    setForm(equipment);
    setFeedback("");
    setModalOpen(true);
  }

  function closeModal() {
    setForm(initialForm);
    setFeedback("");
    setModalOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setFeedback("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    try {
      if (user && form.id) {
        const updatedEquipment = await equipmentService.update({ id: form.id, name: form.name.trim(), category: form.category });
        updateEquipment(updatedEquipment);
      } else if (user) {
        const createdEquipment = await equipmentService.create({
          userId: user.id,
          name: form.name.trim(),
          category: form.category,
        });
        addPersistedEquipment(createdEquipment);
      } else if (form.id) {
        updateEquipment({ id: form.id, name: form.name.trim(), category: form.category });
      } else {
        addEquipment({ name: form.name.trim(), category: form.category });
      }

      closeModal();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar o equipamento.");
    }
  }

  async function handleRemoveEquipment() {
    if (!form.id) {
      return;
    }

    try {
      if (user) {
        await equipmentService.remove(form.id);
      }
      removeEquipment(form.id);
      closeModal();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel remover o equipamento.");
    }
  }

  return (
    <main className="equipment-workspace">
      <header className="timbre-topbar">
        <LoopToneLogo size="sm" />
        <nav className="timbre-nav" aria-label="Navegacao principal">
          <button className="timbre-nav-button" type="button" onClick={() => navigate("/novo-timbre")}>
            Novo Timbre
          </button>
          <button className="timbre-nav-button" type="button" onClick={() => navigate("/meus-timbres")}>
            Meus Timbres
          </button>
          <button className="timbre-nav-button is-active" type="button">
            Equipamentos
          </button>
        </nav>
        <div className="timbre-account">
          <span>Creditos: 15</span>
          <span className="timbre-avatar" aria-hidden="true" />
        </div>
      </header>

      <section className="equipment-page-panel" aria-label="Equipamentos">
        <header className="equipment-page-header">
          <h1>{user?.nome ?? "Usuario"}</h1>
          <button className="equipment-add-button" type="button" onClick={openCreateModal}>
            <span aria-hidden="true">+</span>
            Adicionar Equipamento
          </button>
        </header>

        <div className="equipment-category-stack">
          {(visibleCategories.length > 0 ? visibleCategories : equipmentCategories).map((category) => (
            <section className="equipment-category-row" key={category}>
              <div className="equipment-category-line">
                <h2>{categoryLabels[category]}</h2>
                <span aria-hidden="true" />
              </div>

              <div className="equipment-row-box">
                {groupedEquipments[category].length === 0 ? (
                  <p className="equipment-row-empty">Nenhum equipamento nesta categoria.</p>
                ) : (
                  groupedEquipments[category].map((equipment) => (
                    <button className="equipment-row-chip" type="button" key={equipment.id} onClick={() => openEditModal(equipment)}>
                      <span>{equipment.name}</span>
                      <span className="equipment-edit-mark" aria-hidden="true">
                        editar
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>

        {feedback && <p className="equipment-page-feedback">{feedback}</p>}
      </section>

      {modalOpen && (
        <div className="modal-backdrop">
          <form className="equipment-modal" role="dialog" aria-modal="true" aria-labelledby="equipment-modal-title" onSubmit={handleSubmit}>
            <button className="cancel-button" type="button" onClick={closeModal}>
              Cancelar
            </button>
            <label className="form-field" htmlFor="equipment-name">
              <span id="equipment-modal-title">Nome do Equipamento</span>
              <input
                id="equipment-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                autoFocus
              />
            </label>
            <select
              aria-label="Tipo de Equipamento"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as EquipmentCategory }))}
            >
              {equipmentCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
            {feedback && <p className="form-feedback">{feedback}</p>}
            <div className="equipment-modal-actions">
              {form.id && (
                <button className="modal-danger" type="button" onClick={handleRemoveEquipment}>
                  Remover
                </button>
              )}
              <button className="modal-primary" type="submit">
                {form.id ? "Atualizar" : "Adicionar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
