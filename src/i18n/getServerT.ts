import i18next from "i18next";
import vi from "./vi";

/**
 * Server-only translation accessor — Vietnamese-only, returns a plain
 * `t()` function.
 *
 * Deliberately does NOT go through createI18nInstance()/react-i18next:
 * importing react-i18next triggers a module-scope React.createContext()
 * call, which throws inside the React Server Components runtime
 * (Context is a client-rendering concept, unavailable there). This uses
 * plain i18next core instead — framework-agnostic, no React dependency.
 */
export async function getServerT() {
  const lang = "vi";

  const instance = i18next.createInstance();
  instance.init({
    resources: {
      vi: { translation: vi },
    },
    lng: lang,
    fallbackLng: "vi",
    interpolation: { escapeValue: false },
  });

  return { t: instance.t.bind(instance), lang };
}
