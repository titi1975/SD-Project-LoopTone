export const equipmentCategories = [
  "Instrumentos",
  "Pedais e Efeitos",
  "DAW / Software",
  "Amplificadores",
  "Interface de Audio",
  "Outros",
] as const;

export type EquipmentCategory = (typeof equipmentCategories)[number];

export type Equipment = {
  id: string;
  userId?: number;
  name: string;
  category: EquipmentCategory;
};

export type EquipmentPayload = {
  userId: number;
  name: string;
  category: EquipmentCategory;
};
