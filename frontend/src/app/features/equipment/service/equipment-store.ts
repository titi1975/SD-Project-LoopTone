import { create } from "zustand";
import type { Equipment } from "./equipment-types";

const storageKey = "looptone-equipments";

type EquipmentState = {
  equipments: Equipment[];
  setEquipments: (equipments: Equipment[]) => void;
  addEquipment: (equipment: Omit<Equipment, "id">) => void;
  addPersistedEquipment: (equipment: Equipment) => void;
  updateEquipment: (equipment: Equipment) => void;
  removeEquipment: (id: string) => void;
  clearEquipments: () => void;
};

function loadEquipments(): Equipment[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Equipment[];
  } catch {
    localStorage.removeItem(storageKey);
    return [];
  }
}

function persist(equipments: Equipment[]) {
  localStorage.setItem(storageKey, JSON.stringify(equipments));
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipments: loadEquipments(),
  setEquipments: (equipments) =>
    set(() => {
      persist(equipments);
      return { equipments };
    }),
  addEquipment: (payload) =>
    set((state) => {
      const equipments = [
        ...state.equipments,
        {
          ...payload,
          id: crypto.randomUUID(),
        },
      ];
      persist(equipments);
      return { equipments };
    }),
  addPersistedEquipment: (equipment) =>
    set((state) => {
      const equipments = [...state.equipments, equipment];
      persist(equipments);
      return { equipments };
    }),
  updateEquipment: (equipment) =>
    set((state) => {
      const equipments = state.equipments.map((item) => (String(item.id) === String(equipment.id) ? equipment : item));
      persist(equipments);
      return { equipments };
    }),
  removeEquipment: (id) =>
    set((state) => {
      const equipments = state.equipments.filter((equipment) => String(equipment.id) !== String(id));
      persist(equipments);
      return { equipments };
    }),
  clearEquipments: () =>
    set(() => {
      persist([]);
      return { equipments: [] };
    }),
}));
