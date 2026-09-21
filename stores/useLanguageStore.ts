import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppLanguage = "en" | "id";

interface LanguageStore {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language: AppLanguage) => set({ language }),
    }),
    {
      name: "moryn_app_language",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
