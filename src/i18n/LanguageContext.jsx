import { useState, useCallback, useMemo } from "react";
import en from "./en";
import vi from "./vi";
import { LanguageContext } from "./context";

const translations = { en, vi };
const STORAGE_KEY = "portfolio-lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "vi";
    } catch {
      return "vi";
    }
  });

  const setLang = useCallback((code) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
