import { create } from "zustand";
import type { Equipment, EquipmentCategory } from "./equipment-types";

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
  addEquipment: ({ name, category }) =>
    set((state) => {
      const equipments = [
        ...state.equipments,
        {
          id: crypto.randomUUID(),
          name,
          category,
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
      const equipments = state.equipments.map((item) => (item.id === equipment.id ? equipment : item));
      persist(equipments);
      return { equipments };
    }),
  removeEquipment: (id) =>
    set((state) => {
      const equipments = state.equipments.filter((equipment) => equipment.id !== id);
      persist(equipments);
      return { equipments };
    }),
  clearEquipments: () =>
    set(() => {
      persist([]);
      return { equipments: [] };
    }),
}));

export function groupEquipmentsByCategory(equipments: Equipment[]): Record<EquipmentCategory, Equipment[]> {
  return equipments.reduce(
    (groups, equipment) => ({
      ...groups,
      [equipment.category]: [...groups[equipment.category], equipment],
    }),
    {
      Instrumentos: [],
      "Pedais e Efeitos": [],
      "DAW / Software": [],
      Amplificadores: [],
      "Interface de Audio": [],
      Outros: [],
    } satisfies Record<EquipmentCategory, Equipment[]>,
  );
}
