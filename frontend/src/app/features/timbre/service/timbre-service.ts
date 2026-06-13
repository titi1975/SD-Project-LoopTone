import { httpAdapter } from "../../../infra/adapters/http/HttpAdapter";
import type { TimbreAnalysisResponse, TimbreProject } from "./timbre-types";

export const timbreService = {
  async generateFeedback(payload: {
    equipmentId: number;
    targetArtist: string;
    targetSong: string;
    targetInstrument: string;
    audio: File;
    currentToneSimulation?: string;
  }): Promise<TimbreAnalysisResponse> {
    const formData = new FormData();
    formData.append("equipment_id", String(payload.equipmentId));
    formData.append("target_artist", payload.targetArtist);
    formData.append("target_song", payload.targetSong);
    formData.append("target_instrument", payload.targetInstrument);
    formData.append("audio", payload.audio);
    
    if (payload.currentToneSimulation) {
      formData.append("current_tone_simulation", payload.currentToneSimulation);
    }

    // Passa cabeçalho 'multipart/form-data' explicitly para o axios
    const response = await httpAdapter.post<TimbreAnalysisResponse, FormData>(
      "/api/analysis/feedback",
      formData,
      {
        "Content-Type": "multipart/form-data",
      },
    );
    return response.data;
  },

  async saveProject(project: TimbreProject): Promise<TimbreProject> {
    // O backend não salva análises de timbres no banco de dados.
    // Persistimos isso localmente no timbre-store.ts.
    return project;
  },
};
