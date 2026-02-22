import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import MagneticButton from "../ui/MagneticButton";
import { useLanguage } from "../../i18n/useLanguage";
import { usePublicData } from "../../hooks/usePublicData";
import SkillOrb from "../ui/SkillOrb";

export default function Contact() {
  const { t, lang } = useLanguage();
  const { data: contactLinks, loading } = usePublicData("contacts");

  const renderHeading = () => {
    const parts = t.contact.heading.split("{accent}");
    return <>{parts[0]}<span className="accent">{t.contact.headingAccent}</span>{parts[1]}</>;
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="section-inner contact-inner">
        <FadeSection>
          <span className="section-tag">{t.contact.tag}</span>
        </FadeSection>
        <RevealText className="section-heading contact-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        <FadeSection delay={0.3}>
          <p className="contact-text">{t.contact.text}</p>
        </FadeSection>
        {loading ? (
          <p className="section-loading">{lang === "vi" ? "Đang tải…" : "Loading…"}</p>
        ) : (
          <FadeSection delay={0.3}>
            <div className="contact-links">
              {contactLinks.map((link, i) => (
                <MagneticButton
                  key={link.id}
                  className="contact-link"
                  href={link.href}
                  style={{
                    animationDelay: `${i * 0.06}s`,
                  }}
                  data_type={link?.data_type}
                >
                  <SkillOrb isPlainIcon skill={link} style={{fontSize: '1.3rem'}}/>
                  <span>{link.label}</span>
                </MagneticButton>
              ))}
            </div>
          </FadeSection>
        )}
      </div>
    </section>
  );
}
