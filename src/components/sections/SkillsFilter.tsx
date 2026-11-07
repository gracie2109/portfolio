"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import SkillOrb from "../ui/SkillOrb";

const FILTER_KEYS = ["all", "frontend", "backend", "cloud_tool"];

interface Skill {
  id: string;
  type?: string;
  icon?: string;
  name?: string;
  description?: string;
  link?: string;
}

export default function SkillsFilter({
  skills,
  tabLabels,
  typeLabels,
}: {
  skills: Skill[];
  tabLabels: Record<string, string>;
  typeLabels: Record<string, string>;
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  /* ── Filter skills using useMemo ── */
  const filtered = useMemo(() => {
    if (activeFilter === "all") return skills;
    return skills.filter((s) => (s.type || "frontend") === activeFilter);
  }, [skills, activeFilter]);

  return (
    <>
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
    </>
  );
}
