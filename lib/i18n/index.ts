import { useLanguageStore, type AppLanguage } from "@/stores/useLanguageStore";
import { DICTIONARIES } from "./dictionaries";

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = DICTIONARIES[language] || DICTIONARIES.en;

  return {
    t,
    language,
    setLanguage,
    isId: language === "id",
    isEn: language === "en",
  };
}

export function getTranslations(lang: AppLanguage = "en") {
  return DICTIONARIES[lang] || DICTIONARIES.en;
}

export * from "./dictionaries";
