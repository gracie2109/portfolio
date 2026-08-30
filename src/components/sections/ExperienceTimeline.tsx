"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const side = index % 2 === 0 ? "left" : "right";

  useEffect(() => {
    const el = ref.current;
    if (!el || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isInView]);

  return (
    <div
      ref={ref}
      className={`tl-item tl-item--${side} ${isInView ? "tl-item--visible" : ""}`}
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
        <span className="tl-period">{exp.period}</span>
        <h3 className="tl-role">
          {localizeField(exp, "role", lang)}
        </h3>
        <p className="tl-desc">
          {localizeField(exp, "description", lang)}
        </p>
      </div>
    </div>
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
