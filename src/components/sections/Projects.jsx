import { useMemo } from "react";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import ProjectCard from "../ui/ProjectCard";
import { useLanguage } from "../../i18n/useLanguage";
import { usePublicData } from "../../hooks/usePublicData";

export default function Projects() {
  const { t, lang } = useLanguage();
  const { data: rawProjects, loading } = usePublicData("projects");

  const renderHeading = () => {
    const parts = t.projects.heading.split("{accent}");
    return <>{parts[0]}<span className="accent">{t.projects.headingAccent}</span>{parts[1]}</>;
  };

  /* Map DB rows to the shape ProjectCard expects */
  const projects = useMemo(
    () =>
      rawProjects.map((row) => ({
        ...row,
        title: lang === "vi" ? (row.title_vi || row.title_en) : row.title_en,
        description: lang === "vi" ? (row.description_vi || row.description_en) : row.description_en,
        fallbackTitle: row.title_en,
      })),
    [rawProjects, lang]
  );

  return (
    <section id="projects" className="section projects-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t.projects.tag}</span>
        </FadeSection>
        <RevealText className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        {loading ? (
          <p className="section-loading">{lang === "vi" ? "Đang tải…" : "Loading…"}</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
