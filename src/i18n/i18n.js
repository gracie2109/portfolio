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
 * `i18next` default singleton, so each call (each request, on a server)
 * gets independent state instead of sharing global state across
 * concurrent requests.
 *
 * @param {string} [initialLang] — language resolved server-side (e.g.
 *   from a cookie in a Server Component). Falls back to reading
 *   localStorage when not provided (client-only bootstrap).
 */
export function createI18nInstance(initialLang) {
  const instance = i18next.createInstance();

  instance.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: initialLang ?? getInitialLang(),
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
      try {
        document.cookie = `${STORAGE_KEY}=${lng}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        /* ignore */
      }
    });
  }

  return instance;
}
