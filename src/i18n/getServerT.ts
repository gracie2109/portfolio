import { cookies } from "next/headers";
import i18next from "i18next";
import en from "./en";
import vi from "./vi";

/**
 * Server-only translation accessor — resolves the language from the
 * request cookie and returns a plain `t()` function.
 *
 * Deliberately does NOT go through createI18nInstance()/react-i18next:
 * importing react-i18next triggers a module-scope React.createContext()
 * call, which throws inside the React Server Components runtime
 * (Context is a client-rendering concept, unavailable there). This uses
 * plain i18next core instead — framework-agnostic, no React dependency.
 */
export async function getServerT() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("portfolio-lang")?.value ?? "vi";

  const instance = i18next.createInstance();
  instance.init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: lang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

  return { t: instance.t.bind(instance), lang };
}
