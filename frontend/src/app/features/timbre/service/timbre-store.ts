import { create } from "zustand";
import type { TimbreProject } from "./timbre-types";

const projectsStorageKey = "looptone-timbre-projects";

type TimbreState = {
  projects: TimbreProject[];
  saveProject: (project: TimbreProject) => void;
  deleteProject: (id: string) => void;
};

export const useTimbreStore = create<TimbreState>((set) => ({
  projects: load<TimbreProject[]>(projectsStorageKey, []),
  saveProject: (project) =>
    set((state) => {
      const projects = [project, ...state.projects.filter((item) => item.id !== project.id)];
      persist(projectsStorageKey, projects);
      return { projects };
    }),
  deleteProject: (id) =>
    set((state) => {
      const projects = state.projects.filter((p) => p.id !== id);
      persist(projectsStorageKey, projects);
      return { projects };
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
