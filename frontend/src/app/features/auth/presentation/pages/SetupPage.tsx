import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { useAuthStore } from "../../service/auth-store";
import { equipmentService } from "../../../equipment/service/equipment-service";
import { groupEquipmentsByCategory, useEquipmentStore } from "../../../equipment/service/equipment-store";
import { equipmentCategories, type Equipment, type EquipmentCategory } from "../../../equipment/service/equipment-types";
import { AuthShell } from "../components/AuthShell";
import { AuthStepper } from "../components/AuthStepper";

type EquipmentForm = {
  id?: string;
  name: string;
  category: EquipmentCategory;
};

const initialForm: EquipmentForm = {
  name: "",
  category: "Instrumentos",
};

export function SetupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const equipments = useEquipmentStore((state) => state.equipments);
  const setEquipments = useEquipmentStore((state) => state.setEquipments);
  const addEquipment = useEquipmentStore((state) => state.addEquipment);
  const addPersistedEquipment = useEquipmentStore((state) => state.addPersistedEquipment);
  const updateEquipment = useEquipmentStore((state) => state.updateEquipment);
  const removeEquipment = useEquipmentStore((state) => state.removeEquipment);
  const groupedEquipments = useMemo(() => groupEquipmentsByCategory(equipments), [equipments]);

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

  function openCreateModal(category: EquipmentCategory = "Instrumentos") {
    setForm({ name: "", category });
    setFeedback("");
    setModalOpen(true);
  }

  function openEditModal(equipment: Equipment) {
    setForm(equipment);
    setFeedback("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setFeedback("");
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

  async function handleRemoveEquipment(equipment: Equipment) {
    try {
      if (user) {
        await equipmentService.remove(equipment.id);
      }
      removeEquipment(equipment.id);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel remover o equipamento.");
      openEditModal(equipment);
    }
  }

  function finishSetup() {
    if (equipments.length === 0) {
      setFeedback("Adicione pelo menos um equipamento antes de finalizar.");
      setModalOpen(true);
      return;
    }

    navigate("/concluido");
  }

  return (
    <AuthShell>
      <AuthStepper activeStep={2} />
      <section className="setup-card">
        <div className="setup-header">
          <div>
            <h1>Seu setup de Equipamentos</h1>
            <p>Adicione os equipamentos que voce usa. Voce pode editar depois a qualquer momento.</p>
          </div>
          <button className="outline-button" type="button" onClick={() => openCreateModal()}>
            + Adicionar Equipamento
          </button>
        </div>

        <div className="equipment-grid">
          {equipmentCategories.map((category) => (
            <section className="equipment-field" key={category}>
              <div className="equipment-category-header">
                <span>{category}</span>
              </div>

              <div className="equipment-list">
                {groupedEquipments[category].length === 0 ? (
                  <span className="empty-equipment">Nenhum equipamento</span>
                ) : (
                  groupedEquipments[category].map((equipment) => (
                    <div className="equipment-chip" key={equipment.id}>
                      <button type="button" onClick={() => openEditModal(equipment)}>
                        {equipment.name}
                      </button>
                      <button type="button" onClick={() => handleRemoveEquipment(equipment)} aria-label={`Remover ${equipment.name}`}>
                        x
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </section>

      <PrimaryButton className="finish-button" type="button" onClick={finishSetup}>
        Finalizar
      </PrimaryButton>

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
                <option key={category}>{category}</option>
              ))}
            </select>
            {feedback && <p className="form-feedback">{feedback}</p>}
            <button className="modal-primary" type="submit">
              {form.id ? "Atualizar" : "Adicionar"}
            </button>
          </form>
        </div>
      )}
    </AuthShell>
  );
}
