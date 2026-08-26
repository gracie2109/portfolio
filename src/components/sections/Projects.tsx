import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import ProjectCard from "../ui/ProjectCard";
import { getServerT } from "../../i18n/getServerT";
import { getPublicData } from "../../services/publicDataServer";
import { localizeField } from "../../i18n/localize";

interface RawProject {
  id: string;
  emoji?: string;
  title_en?: string;
  title_vi?: string;
  description_en?: string;
  description_vi?: string;
  tags?: string[];
  [key: string]: unknown;
}

export default async function Projects() {
  const { t, lang } = await getServerT();
  const rawProjects = await getPublicData<RawProject>("projects");

  const renderHeading = () => {
    const parts = t("projects.heading").split("{accent}");
    return <>{parts[0]}<span className="accent">{t("projects.headingAccent")}</span>{parts[1]}</>;
  };

  /* Map DB rows to the shape ProjectCard expects */
  const projects = rawProjects.map((row) => ({
    ...row,
    title: localizeField(row, "title", lang),
    description: localizeField(row, "description", lang),
    fallbackTitle: row.title_en,
  }));

  return (
    <section id="projects" className="section projects-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t("projects.tag")}</span>
        </FadeSection>
        <RevealText className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
