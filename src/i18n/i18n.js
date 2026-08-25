import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import vi from "./vi";

const STORAGE_KEY = "portfolio-lang";

function getInitialLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "vi";
  } catch {
    return "vi";
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: getInitialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore, same as old LanguageContext behavior */
  }
});

export default i18n;
