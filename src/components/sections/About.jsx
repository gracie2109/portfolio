import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { useLanguage } from "../../i18n/useLanguage";

export default function About() {
  const { t } = useLanguage();

  const renderHeading = () => {
    const parts = t.about.heading.split("{accent}");
    return <>{parts[0]}<span className="accent">{t.about.headingAccent}</span>{parts[1]}</>;
  };

  return (
    <section id="about" className="section about-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t.about.tag}</span>
        </FadeSection>
        <RevealText className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        <FadeSection delay={0.3}>
          <p className="about-text">{t.about.text1}</p>
        </FadeSection>
        <FadeSection delay={0.4}>
          <p className="about-text">{t.about.text2}</p>
        </FadeSection>
        <FadeSection delay={0.5}>
          <div className="about-stats">
            {t.about.stats.map((stat) => (
              <div key={stat.label} className="stat">
                <span className="stat-num">{stat.num}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </FadeSection>
      </div>
    </section>
  );
}
