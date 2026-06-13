import { create } from "zustand";

type CreditsState = {
  credits: number;
  isPremium: boolean;
  initialFiveCreditsExhausted: boolean;
  lastSpentTime: string | null;
  subscribe: () => void;
  unsubscribe: () => void;
  spendCredit: () => boolean;
  addCredits: (amount: number) => void;
  resetCredits: () => void;
  checkAndRefreshCredits: () => void;
  simulateTimePassage: (hours: number) => void;
};

const getLocalStorageItem = (key: string, defaultValue: string) => {
  return localStorage.getItem(key) || defaultValue;
};

export const useCreditsStore = create<CreditsState>((set, get) => ({
  credits: parseInt(getLocalStorageItem("looptone-credits", "5"), 10),
  isPremium: getLocalStorageItem("looptone-is-premium", "false") === "true",
  initialFiveCreditsExhausted: getLocalStorageItem("looptone-initial-exhausted", "false") === "true",
  lastSpentTime: localStorage.getItem("looptone-last-spent-time"),

  subscribe: () => {
    const now = new Date().toISOString();
    localStorage.setItem("looptone-is-premium", "true");
    localStorage.setItem("looptone-credits", "20");
    localStorage.setItem("looptone-last-spent-time", now);
    set({
      isPremium: true,
      credits: 20,
      lastSpentTime: now,
    });
  },

  unsubscribe: () => {
    const now = new Date().toISOString();
    localStorage.setItem("looptone-is-premium", "false");
    localStorage.setItem("looptone-credits", "3");
    localStorage.setItem("looptone-last-spent-time", now);
    set({
      isPremium: false,
      credits: 3,
      lastSpentTime: now,
    });
  },

  spendCredit: () => {
    const { credits, initialFiveCreditsExhausted, isPremium } = get();
    if (credits <= 0) return false;

    const nextCredits = credits - 1;
    const now = new Date().toISOString();

    let nextExhausted = initialFiveCreditsExhausted;
    if (!isPremium && !initialFiveCreditsExhausted && nextCredits === 0) {
      nextExhausted = true;
      localStorage.setItem("looptone-initial-exhausted", "true");
    }

    localStorage.setItem("looptone-credits", nextCredits.toString());
    localStorage.setItem("looptone-last-spent-time", now);

    set({
      credits: nextCredits,
      initialFiveCreditsExhausted: nextExhausted,
      lastSpentTime: now,
    });
    return true;
  },

  addCredits: (amount) => {
    const nextCredits = get().credits + amount;
    localStorage.setItem("looptone-credits", nextCredits.toString());
    set({ credits: nextCredits });
  },

  resetCredits: () => {
    localStorage.removeItem("looptone-credits");
    localStorage.removeItem("looptone-is-premium");
    localStorage.removeItem("looptone-initial-exhausted");
    localStorage.removeItem("looptone-last-spent-time");
    set({
      credits: 5,
      isPremium: false,
      initialFiveCreditsExhausted: false,
      lastSpentTime: null,
    });
  },

  checkAndRefreshCredits: () => {
    const { credits, isPremium, lastSpentTime, initialFiveCreditsExhausted } = get();
    if (!lastSpentTime) return;

    const spentDate = new Date(lastSpentTime);
    const now = new Date();
    const diffMs = now.getTime() - spentDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 48) {
      let refreshedCredits = credits;
      if (isPremium) {
        refreshedCredits = 20;
      } else if (initialFiveCreditsExhausted || credits < 3) {
        refreshedCredits = 3;
      }

      if (refreshedCredits !== credits) {
        localStorage.setItem("looptone-credits", refreshedCredits.toString());
        localStorage.setItem("looptone-last-spent-time", now.toISOString());
        set({
          credits: refreshedCredits,
          lastSpentTime: now.toISOString(),
        });
      }
    }
  },

  simulateTimePassage: (hours) => {
    const { lastSpentTime, credits, isPremium, initialFiveCreditsExhausted } = get();
    const baseTime = lastSpentTime ? new Date(lastSpentTime) : new Date();
    // Go back in time for lastSpentTime, simulating hours passing
    baseTime.setHours(baseTime.getHours() - hours);
    const fakeSpentTime = baseTime.toISOString();
    localStorage.setItem("looptone-last-spent-time", fakeSpentTime);

    const diffHours = hours; // pass simulated hours directly
    let refreshedCredits = credits;
    let nextExhausted = initialFiveCreditsExhausted;

    if (diffHours >= 48) {
      if (isPremium) {
        refreshedCredits = 20;
      } else if (initialFiveCreditsExhausted || credits < 3) {
        refreshedCredits = 3;
        nextExhausted = true;
        localStorage.setItem("looptone-initial-exhausted", "true");
      }
    }

    localStorage.setItem("looptone-credits", refreshedCredits.toString());
    set({
      lastSpentTime: fakeSpentTime,
      credits: refreshedCredits,
      initialFiveCreditsExhausted: nextExhausted
    });
  }
}));
