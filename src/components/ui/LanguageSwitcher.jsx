import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n/languages";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="lang-switcher">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${lang === l.code ? "lang-active" : ""}`}
          onClick={() => i18n.changeLanguage(l.code)}
          aria-label={`Switch to ${l.label}`}
        >
          <span className="lang-flag">{l.flag}</span>
          <span className="lang-code">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
