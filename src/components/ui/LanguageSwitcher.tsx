"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { LANGUAGES } from "../../i18n/languages";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;

  const handleChange = async (code: string) => {
    await i18n.changeLanguage(code);
    // About/Skills/Experience are Server Components that read the
    // language cookie at request time — refresh so they re-render in
    // the new language instead of only the Client Component sections.
    router.refresh();
  };

  return (
    <div className="lang-switcher">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${lang === l.code ? "lang-active" : ""}`}
          onClick={() => handleChange(l.code)}
          aria-label={`Switch to ${l.label}`}
        >
          <span className="lang-flag">{l.flag}</span>
          <span className="lang-code">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
