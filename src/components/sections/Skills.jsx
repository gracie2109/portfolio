import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import SkillOrb from "../ui/SkillOrb";
import { useLanguage } from "../../i18n/useLanguage";
import { usePublicData } from "../../hooks/usePublicData";

const FILTER_KEYS = ["all", "frontend", "backend", "cloud_tool"];

export default function Skills() {
  const { t, lang } = useLanguage();
  const { data: skills, loading } = usePublicData("skills");
  const [activeFilter, setActiveFilter] = useState("all");

  /* ── Filter skills using useMemo ── */
  const filtered = useMemo(() => {
    if (activeFilter === "all") return skills;
    return skills.filter((s) => (s.type || "frontend") === activeFilter);
  }, [skills, activeFilter]);

  const renderHeading = () => {
    const parts = t.skills.heading.split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t.skills.headingAccent}</span>
        {parts[1]}
      </>
    );
  };

  /* ── Tab labels (i18n) ── */
  const tabLabels = t.skills.tabs || {
    all: lang === "vi" ? "Tất cả" : "All",
    frontend: "Frontend",
    backend: "Backend",
    // database: "Database",
    cloud_tool: "Cloud & Tools",
  };

  /* ── Type sub-label per skill ── */
  const typeLabels = t.skills.groups || {
    frontend: "FRONTEND",
    backend: "BACKEND",
    // database: "DATABASE",
    cloud_tool: "CLOUD & TOOLS",
  };

  return (
    <section id="skills" className="section skills-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t.skills.tag}</span>
        </FadeSection>
        <RevealText className="section-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>

        {/* ── Filter Tabs ── */}
        <div className="skills-tabs">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              className={`skills-tab ${activeFilter === key ? "skills-tab--active" : ""}`}
              onClick={() => setActiveFilter(key)}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="section-loading">
            {lang === "vi" ? "Đang tải…" : "Loading…"}
          </p>
        ) : (
          <div className="skills-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((skill, i) => (
                <SkillOrb
                  key={skill.id}
                  skill={skill}
                  index={i}
                  typeLabel={typeLabels[skill.type || "frontend"]?.toUpperCase()}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
