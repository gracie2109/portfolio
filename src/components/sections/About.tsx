import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { getServerT } from "../../i18n/getServerT";
import { localizeField } from "../../i18n/localize";
import { getPublicData } from "../../services/publicDataServer";
import { getExperienceYears, type ExperienceRange } from "../../utils/experienceYears";

interface ExperienceRow extends ExperienceRange {
  company?: string;
  role_vi?: string;
  role_en?: string;
  [key: string]: unknown;
}

interface Stat {
  num: string;
  label: string;
}

export default async function About() {
  const { t, lang } = await getServerT();
  const experiences = await getPublicData<ExperienceRow>("experiences", {
    orderBy: "start_time",
    ascending: false,
  });
  const experienceYears = getExperienceYears(experiences);
  const currentJob = experiences.find((exp) => exp.start_time && !exp.end_time);

  const renderHeading = () => {
    const parts = t("about.heading").split("{accent}");
    return <>{parts[0]}<span className="accent">{t("about.headingAccent")}</span>{parts[1]}</>;
  };

  const stats = (t("about.stats", { returnObjects: true }) as unknown as Stat[]).map(
    (stat, index) => (index === 2 ? { ...stat, num: `${experienceYears}+` } : stat)
  );

  return (
    <section id="about" className="section about-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t("about.tag")}</span>
        </FadeSection>
        <RevealText as="h2" className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>

        <div className="about-grid">
          <div className="about-copy">
            <FadeSection delay={0.3}>
              <p className="about-text about-text--lead">
                {t("about.text1", { exp: experienceYears })}
              </p>
            </FadeSection>
            <FadeSection delay={0.4}>
              <p className="about-text">{t("about.text2")}</p>
            </FadeSection>
            <FadeSection delay={0.4}>
              <p className="about-text">{t("about.text3")}</p>
            </FadeSection>
          </div>

          <FadeSection delay={0.5}>
            <aside className="about-side">
              {currentJob?.company && (
                <div className="about-now">
                  <span className="about-now-label">
                    <span className="badge-dot" /> {t("about.currently")}
                  </span>
                  <span className="about-now-role">
                    {localizeField(currentJob, "role", lang) || "Frontend Developer"}
                  </span>
                  <span className="about-now-company">@ {currentJob.company}</span>
                </div>
              )}
              <div className="about-stats">
                {stats.map((stat) => (
                  <div key={stat.label} className="stat">
                    <span className="stat-num">{stat.num}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </FadeSection>
        </div>
      </div>
    </section>
  );
}
