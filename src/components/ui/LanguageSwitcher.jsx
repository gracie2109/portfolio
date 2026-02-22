import { useLanguage } from "../../i18n/useLanguage";
import { LANGUAGES } from "../../i18n/languages";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switcher">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${lang === l.code ? "lang-active" : ""}`}
          onClick={() => setLang(l.code)}
          aria-label={`Switch to ${l.label}`}
        >
          <span className="lang-flag">{l.flag}</span>
          <span className="lang-code">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
