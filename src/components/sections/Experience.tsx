import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import ExperienceTimeline from "./ExperienceTimeline";
import { getServerT } from "../../i18n/getServerT";
import { getPublicData } from "../../services/publicDataServer";
import { formatPeriod, getDuration } from "../../utils/experienceDuration";

interface RawExperience {
  id: string;
  company?: string;
  start_time?: string | null;
  end_time?: string | null;
  role_en?: string;
  role_vi?: string;
  description_en?: string;
  description_vi?: string;
  [key: string]: unknown;
}

export default async function Experience() {
  const { t, lang } = await getServerT();
  const experiences = await getPublicData<RawExperience>("experiences", {
    orderBy: "start_time",
    ascending: false,
  });

  const heading = (() => {
    const parts = t("experience.heading").split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t("experience.headingAccent")}</span>
        {parts[1]}
      </>
    );
  })();

  const timelineData = experiences.map((exp) => ({
    ...exp,
    period: formatPeriod(exp.start_time ?? "", exp.end_time, lang),
    duration: getDuration(exp.start_time, exp.end_time, lang),
  }));

  return (
    <section id="experience" className="section experience-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t("experience.tag")}</span>
        </FadeSection>

        <RevealText className="section-heading" delay={0.1}>
          {heading}
        </RevealText>

        <ExperienceTimeline timelineData={timelineData} lang={lang} />
      </div>
    </section>
  );
}
