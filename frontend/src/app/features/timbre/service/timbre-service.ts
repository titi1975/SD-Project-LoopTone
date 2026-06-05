import { httpAdapter } from "../../../infra/adapters/http/HttpAdapter";
import type { TimbreChatPayload, TimbreChatResponse, TimbreProject } from "./timbre-types";

const useBackendChat = import.meta.env.VITE_TIMBRE_CHAT_BACKEND === "true";

export const timbreService = {
  async sendChatMessage(payload: TimbreChatPayload): Promise<TimbreChatResponse> {
    if (useBackendChat) {
      const response = await httpAdapter.post<TimbreChatResponse, TimbreChatPayload>("/api/timbres/chat", payload);
      return response.data;
    }

    await wait(450);

    const equipment = payload.equipmentNames.slice(0, 4);
    const settings =
      equipment.length > 0
        ? equipment.map((name, index) => `${name} ${index === 0 ? "7.5" : index === 1 ? "6.0" : index === 2 ? "5.0" : "6"}`)
        : ["Ganho 6.5", "Medios 5.5", "Presence 6", "Level 5"];

    return {
      message: {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Analisei sua descricao e montei um ponto de partida. Ajuste o ganho aos poucos e compare com sua referencia antes de salvar o resumo do timbre.",
        settings,
        createdAt: new Date().toISOString(),
      },
      summary: buildSummary(payload.prompt, settings),
    };
  },

  async saveProject(project: TimbreProject): Promise<TimbreProject> {
    if (useBackendChat) {
      const response = await httpAdapter.post<TimbreProject, TimbreProject>("/api/timbres/", project);
      return response.data;
    }

    return project;
  },
};

function buildSummary(prompt: string, settings: string[]) {
  return `Pedido: ${prompt.trim()}. Ajustes sugeridos: ${settings.join(", ")}.`;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
