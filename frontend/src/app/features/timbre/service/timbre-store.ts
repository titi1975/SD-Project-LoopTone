import { create } from "zustand";
import type { TimbreChatMessage, TimbreProject } from "./timbre-types";

const messagesStorageKey = "looptone-timbre-chat";
const projectsStorageKey = "looptone-timbre-projects";

type TimbreState = {
  messages: TimbreChatMessage[];
  projects: TimbreProject[];
  draftSummary: string;
  addMessage: (message: TimbreChatMessage) => void;
  setDraftSummary: (summary: string) => void;
  saveProject: (project: TimbreProject) => void;
  resetChat: () => void;
};

export const useTimbreStore = create<TimbreState>((set) => ({
  messages: load<TimbreChatMessage[]>(messagesStorageKey, []),
  projects: load<TimbreProject[]>(projectsStorageKey, []),
  draftSummary: "",
  addMessage: (message) =>
    set((state) => {
      const messages = [...state.messages, message];
      persist(messagesStorageKey, messages);
      return { messages };
    }),
  setDraftSummary: (draftSummary) => set({ draftSummary }),
  saveProject: (project) =>
    set((state) => {
      const projects = [project, ...state.projects.filter((item) => item.id !== project.id)];
      persist(projectsStorageKey, projects);
      return { projects };
    }),
  resetChat: () =>
    set(() => {
      persist(messagesStorageKey, []);
      return { messages: [], draftSummary: "" };
    }),
}));

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function persist<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
