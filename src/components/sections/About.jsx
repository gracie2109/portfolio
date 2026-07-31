import { useMemo } from "react";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { useLanguage } from "../../i18n/useLanguage";
import { usePublicData } from "../../hooks/usePublicData";

function getDateFromMonth(value) {
  if (!value) return null;

  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getExperienceYears(experiences) {
  const ranges = experiences
    .map((exp) => ({
      start: getDateFromMonth(exp.start_time),
      end: getDateFromMonth(exp.end_time),
    }))
    .filter(({ start }) => start);

  if (ranges.length === 0) return 0;

  const earliestStart = ranges.reduce(
    (earliest, { start }) => (start < earliest ? start : earliest),
    ranges[0].start
  );
  const hasCurrentRole = ranges.some(({ end }) => !end);
  const latestEnd = hasCurrentRole
    ? new Date()
    : ranges.reduce(
        (latest, { end }) => (end && end > latest ? end : latest),
        ranges[0].end || ranges[0].start
      );
  const totalMonths =
    (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
    (latestEnd.getMonth() - earliestStart.getMonth()) +
    1;

  return Math.max(0, Math.floor(totalMonths / 12));
}

export default function About() {
  const { t } = useLanguage();
  const { data: experiences = [] } = usePublicData("experiences", {
    orderBy: "start_time",
    ascending: false,
  });
  const experienceYears = useMemo(
    () => getExperienceYears(experiences),
    [experiences]
  );

  const formatText = (text, values) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`{${key}}`, value),
      text
    );

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
          <p className="about-text">
            {formatText(t.about.text1, { exp: experienceYears })}
          </p>
        </FadeSection>
        <FadeSection delay={0.4}>
          <p className="about-text">{t.about.text2}</p>
        </FadeSection>
        <FadeSection delay={0.4}>
          <p className="about-text">{t.about.text3}</p>
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
