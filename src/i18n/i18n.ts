import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./vi";

/**
 * Creates a fresh i18next instance rather than mutating the imported
 * `i18next` default singleton, so each call (each request, on a server)
 * gets independent state instead of sharing global state across
 * concurrent requests.
 *
 * Vietnamese-only: multi-language support (cookie/localStorage-based
 * lang switching) was removed to let the homepage render statically.
 */
export function createI18nInstance() {
  const instance = i18next.createInstance();

  instance.use(initReactI18next).init({
    resources: {
      vi: { translation: vi },
    },
    lng: "vi",
    fallbackLng: "vi",
    interpolation: { escapeValue: false },
  });

  return instance;
}
