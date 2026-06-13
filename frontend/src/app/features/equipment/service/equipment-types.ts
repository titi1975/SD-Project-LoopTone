export type Instrument = {
  brand: string;
  model: string;
};

export type Amp = {
  brand: string;
  model: string;
};

export type Equipment = {
  id: string;
  userId?: number;
  profileName: string;
  instrumentType: "Guitarra" | "Baixo" | "Violão";
  instrument: Instrument;
  amps: Amp[];
  pedals: string[];
  daws?: string[];
};

export type EquipmentPayload = {
  profileName: string;
  instrumentType: "Guitarra" | "Baixo" | "Violão";
  instrument: Instrument;
  amps: Amp[];
  pedals: string[];
  daws?: string[];
};
