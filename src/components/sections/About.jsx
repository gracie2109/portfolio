import { useMemo } from "react";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { useTranslation } from "react-i18next";
import { usePublicData } from "../../hooks/usePublicData";
import { getExperienceYears } from "../../utils/experienceYears";

export default function About() {
  const { t } = useTranslation();
  const { data: experiences = [] } = usePublicData("experiences", {
    orderBy: "start_time",
    ascending: false,
  });
  const experienceYears = useMemo(
    () => getExperienceYears(experiences),
    [experiences]
  );

  const renderHeading = () => {
    const parts = t("about.heading").split("{accent}");
    return <>{parts[0]}<span className="accent">{t("about.headingAccent")}</span>{parts[1]}</>;
  };

  return (
    <section id="about" className="section about-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t("about.tag")}</span>
        </FadeSection>
        <RevealText className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        <FadeSection delay={0.3}>
          <p className="about-text">
            {t("about.text1", { exp: experienceYears })}
          </p>
        </FadeSection>
        <FadeSection delay={0.4}>
          <p className="about-text">{t("about.text2")}</p>
        </FadeSection>
        <FadeSection delay={0.4}>
          <p className="about-text">{t("about.text3")}</p>
        </FadeSection>
        <FadeSection delay={0.5}>
          <div className="about-stats">
            {t("about.stats", { returnObjects: true }).map((stat) => (
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
