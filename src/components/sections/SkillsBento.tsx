"use client";

import { useMemo } from "react";
import SkillOrb from "../ui/SkillOrb";
import { capitalizeFirstLetter } from "../../../utils/string";

/* Display order of the groups; unknown types fall into "frontend". */
const GROUP_ORDER = ["frontend", "backend", "database", "cloud_tool"];

interface Skill {
  id: string;
  type?: string;
  icon?: string;
  name?: string;
  description?: string;
  link?: string;
}

const groupSkills = (skills: Skill[]) => {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const type = GROUP_ORDER.includes(skill.type ?? "") ? (skill.type as string) : "frontend";
    groups.set(type, [...(groups.get(type) ?? []), skill]);
  }
  return GROUP_ORDER.filter((type) => groups.has(type)).map((type) => ({
    type,
    skills: groups.get(type) as Skill[],
  }));
};

const SkillChip = ({ skill }: { skill: Skill }) => {
  const content = (
    <>
      <SkillOrb isPlainIcon skill={skill} />
      <span>{skill.name}</span>
    </>
  );
  const title = skill.description ? capitalizeFirstLetter(skill.description) : undefined;

  if (skill.link) {
    return (
      <a className="skill-chip" href={skill.link} target="_blank" rel="noopener noreferrer" title={title}>
        {content}
      </a>
    );
  }
  return (
    <span className="skill-chip" title={title}>
      {content}
    </span>
  );
};

export default function SkillsBento({
  skills,
  typeLabels,
}: {
  skills: Skill[];
  typeLabels: Record<string, string>;
}) {
  const groups = useMemo(() => groupSkills(skills), [skills]);

  return (
    <div className="skills-bento">
      {groups.map(({ type, skills: groupItems }) => (
        <section key={type} className={`skills-panel skills-panel--${type}`} aria-label={typeLabels[type]}>
          <header className="skills-panel-head">
            <h3>{typeLabels[type] ?? type}</h3>
            <span className="skills-panel-count">{String(groupItems.length).padStart(2, "0")}</span>
          </header>
          <div className="skills-panel-list">
            {groupItems.map((skill) => (
              <SkillChip key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
