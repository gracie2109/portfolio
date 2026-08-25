import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import vi from "./vi";

const STORAGE_KEY = "portfolio-lang";

function getInitialLang() {
  if (typeof window === "undefined") return "vi";
  try {
    return localStorage.getItem(STORAGE_KEY) || "vi";
  } catch {
    return "vi";
  }
}

/**
 * Creates a fresh i18next instance rather than mutating the imported
 * `i18next` default singleton. On Vite/CSR this is called once at app
 * bootstrap; the factory shape is what later lets a server framework
 * create one instance per request instead of sharing global state
 * across concurrent requests.
 */
export function createI18nInstance() {
  const instance = i18next.createInstance();

  instance.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: getInitialLang(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

  if (typeof window !== "undefined") {
    instance.on("languageChanged", (lng) => {
      try {
        localStorage.setItem(STORAGE_KEY, lng);
      } catch {
        /* ignore, same as old LanguageContext behavior */
      }
    });
  }

  return instance;
}
