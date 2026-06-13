import { httpAdapter } from "../../../infra/adapters/http/HttpAdapter";
import type { Equipment, EquipmentPayload } from "./equipment-types";

type EquipmentResponse = {
  id: number;
  userId: number;
  profileName: string;
  instrumentType: "Guitarra" | "Baixo" | "Violão";
  instrument: { brand: string; model: string };
  amps: Array<{ brand: string; model: string }>;
  pedals: string[];
  daws?: string[];
};

function toEquipment(response: EquipmentResponse): Equipment {
  return {
    id: String(response.id),
    userId: response.userId,
    profileName: response.profileName,
    instrumentType: response.instrumentType,
    instrument: response.instrument,
    amps: response.amps || [],
    pedals: response.pedals || [],
    daws: response.daws || [],
  };
}

export const equipmentService = {
  async listByUser(_userId: number): Promise<Equipment[]> {
    // A rota "/api/equipments/me" do backend retorna setups do usuário autenticado via JWT
    const response = await httpAdapter.get<EquipmentResponse[]>("/api/equipments/me");
    return response.data.map(toEquipment);
  },

  async create(payload: EquipmentPayload): Promise<Equipment> {
    const response = await httpAdapter.post<EquipmentResponse, EquipmentPayload>("/api/equipments/", payload);
    return toEquipment(response.data);
  },

  async update(equipment: Equipment): Promise<Equipment> {
    const payload: EquipmentPayload = {
      profileName: equipment.profileName,
      instrumentType: equipment.instrumentType,
      instrument: equipment.instrument,
      amps: equipment.amps,
      pedals: equipment.pedals,
      daws: equipment.daws,
    };
    const response = await httpAdapter.put<EquipmentResponse, EquipmentPayload>(
      `/api/equipments/${equipment.id}`,
      payload,
    );
    return toEquipment(response.data);
  },

  async remove(equipmentId: string): Promise<void> {
    await httpAdapter.delete<{ message: string }>(`/api/equipments/${equipmentId}`);
  },
};
