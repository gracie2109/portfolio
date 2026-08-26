import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import SkillsFilter from "./SkillsFilter";
import { getServerT } from "../../i18n/getServerT";
import { getPublicData } from "../../services/publicDataServer";

interface RawSkill {
  id: string;
  type?: string;
  icon?: string;
  name?: string;
  description?: string;
  link?: string;
}

export default async function Skills() {
  const { t } = await getServerT();
  const skills = await getPublicData<RawSkill>("skills");

  const renderHeading = () => {
    const parts = t("skills.heading").split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t("skills.headingAccent")}</span>
        {parts[1]}
      </>
    );
  };

  /* ── Tab labels (i18n) ── */
  const tabLabels = t("skills.tabs", { returnObjects: true }) as unknown as Record<string, string>;

  /* ── Type sub-label per skill ── */
  const typeLabels = t("skills.groups", { returnObjects: true }) as unknown as Record<string, string>;

  return (
    <section id="skills" className="section skills-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t("skills.tag")}</span>
        </FadeSection>
        <RevealText className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>

        <SkillsFilter skills={skills} tabLabels={tabLabels} typeLabels={typeLabels} />
      </div>
    </section>
  );
}
