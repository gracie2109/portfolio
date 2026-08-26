"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { localizeField } from "../../i18n/localize";

interface TimelineExp {
  id: string;
  company?: string;
  period: string;
  duration: string;
  role_en?: string;
  role_vi?: string;
  description_en?: string;
  description_vi?: string;
  [key: string]: unknown;
}

/* ── Single timeline card ── */
function TimelineCard({
  exp,
  index,
  lang,
  isFirst,
}: {
  exp: TimelineExp;
  index: number;
  lang: string;
  isFirst: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3, margin: "-40px" });
  const side = index % 2 === 0 ? "left" : "right";

  return (
    <motion.div
      ref={ref}
      className={`tl-item tl-item--${side}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Dot on the line */}
      <div className="tl-dot-wrap">
        <span className={`tl-dot${isFirst ? " tl-dot--active" : ""}`} />
      </div>

      {/* Company name on the opposite side */}
      <div className="tl-opposite">
        <span className="tl-company-opposite">{exp.company}</span>
        <span className="tl-duration"> {exp.duration}</span>
      </div>

      {/* Card */}
      <div className="tl-card">
        <span className="tl-period">
          {exp.period}
          {exp.duration && (
            <span className="tl-duration"> · {exp.duration}</span>
          )}
        </span>
        <h3 className="tl-role">
          {localizeField(exp, "role", lang)}
        </h3>
        <p className="tl-desc">
          {localizeField(exp, "description", lang)}
        </p>
      </div>
    </motion.div>
  );
}

export default function ExperienceTimeline({
  timelineData,
  lang,
}: {
  timelineData: TimelineExp[];
  lang: string;
}) {
  return (
    <div className="tl">
      {/* Vertical glowing line */}
      <div className="tl-line" />

      {timelineData.map((exp, i) => (
        <TimelineCard
          key={exp.id}
          exp={exp}
          index={i}
          lang={lang}
          isFirst={i === 0}
        />
      ))}
    </div>
  );
}
