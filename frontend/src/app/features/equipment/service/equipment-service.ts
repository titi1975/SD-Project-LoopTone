import { httpAdapter } from "../../../infra/adapters/http/HttpAdapter";
import type { Equipment, EquipmentPayload } from "./equipment-types";

type EquipmentResponse = {
  id: number;
  userId: number;
  name: string;
  category: string;
};

function toEquipment(response: EquipmentResponse): Equipment {
  return {
    id: String(response.id),
    userId: response.userId,
    name: response.name,
    category: response.category as Equipment["category"],
  };
}

export const equipmentService = {
  async listByUser(userId: number): Promise<Equipment[]> {
    const response = await httpAdapter.get<EquipmentResponse[]>(`/api/equipments/?user_id=${userId}`);
    return response.data.map(toEquipment);
  },

  async create(payload: EquipmentPayload): Promise<Equipment> {
    const response = await httpAdapter.post<EquipmentResponse, EquipmentPayload>("/api/equipments/", payload);
    return toEquipment(response.data);
  },

  async update(equipment: Equipment): Promise<Equipment> {
    const response = await httpAdapter.put<EquipmentResponse, Pick<Equipment, "name" | "category">>(
      `/api/equipments/${equipment.id}`,
      {
        name: equipment.name,
        category: equipment.category,
      },
    );
    return toEquipment(response.data);
  },

  async remove(equipmentId: string): Promise<void> {
    await httpAdapter.delete<{ message: string }>(`/api/equipments/${equipmentId}`);
  },
};
