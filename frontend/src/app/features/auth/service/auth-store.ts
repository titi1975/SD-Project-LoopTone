import { create } from "zustand";
import type { User } from "./auth-types";

const tokenStorageKey = "looptone-token";
const userStorageKey = "looptone-user";

type AuthState = {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(tokenStorageKey),
  user: loadStoredUser(),
  setSession: (token, user) => {
    localStorage.setItem(tokenStorageKey, token);
    localStorage.setItem(userStorageKey, JSON.stringify(user));
    set({ token, user });
  },
  clearSession: () => {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    set({ token: null, user: null });
  },
}));

function loadStoredUser(): User | null {
  const raw = localStorage.getItem(userStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(userStorageKey);
    return null;
  }
}
