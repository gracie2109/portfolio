import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { getServerT } from "../../i18n/getServerT";
import { getPublicData } from "../../services/publicDataServer";
import { getExperienceYears, type ExperienceRange } from "../../utils/experienceYears";

interface Stat {
  num: string;
  label: string;
}

export default async function About() {
  const { t } = await getServerT();
  const experiences = await getPublicData<ExperienceRange>("experiences", {
    orderBy: "start_time",
    ascending: false,
  });
  const experienceYears = getExperienceYears(experiences);

  const renderHeading = () => {
    const parts = t("about.heading").split("{accent}");
    return <>{parts[0]}<span className="accent">{t("about.headingAccent")}</span>{parts[1]}</>;
  };

  const stats = t("about.stats", { returnObjects: true }) as unknown as Stat[];

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
            {stats.map((stat) => (
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
