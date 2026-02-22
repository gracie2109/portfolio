import { useMemo, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { useLanguage } from "../../i18n/useLanguage";
import { usePublicData } from "../../hooks/usePublicData";

/* ── Single timeline card ── */
function TimelineCard({ exp, index, lang, isFirst }) {
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
      </div>

      {/* Card */}
      <div className="tl-card">
        <span className="tl-period">
          {exp.period}
          {exp.duration && <span className="tl-duration"> · {exp.duration}</span>}
        </span>
        <h3 className="tl-role">
          {lang === "vi" ? exp.role_vi || exp.role_en : exp.role_en}
        </h3>
        <p className="tl-desc">
          {lang === "vi"
            ? exp.description_vi || exp.description_en
            : exp.description_en}
        </p>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const { t, lang } = useLanguage();
  const { data: experiences = [], loading } = usePublicData("experiences", {
    orderBy: "start_time",
    ascending: false,
  });

  const heading = useMemo(() => {
    const parts = t.experience.heading.split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t.experience.headingAccent}</span>
        {parts[1]}
      </>
    );
  }, [t]);

  const formatPeriod = useCallback(
    (start, end) => {
      if (end) return `${start} — ${end}`;
      return `${start} — ${lang === "vi" ? "Hiện tại" : "Present"}`;
    },
    [lang]
  );

  const getDuration = useCallback(
    (startString, endString) => {
      if (!startString) return "";
      const startYear = +startString.slice(0, 4);
      const startMonth = +startString.slice(5, 7);
      const now = new Date();
      let endYear, endMonth;
      if (!endString) {
        endYear = now.getFullYear();
        endMonth = now.getMonth() + 1;
      } else {
        endYear = +endString.slice(0, 4);
        endMonth = +endString.slice(5, 7);
      }
      const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
      if (totalMonths <= 0) return "";
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      if (lang === "vi") {
        if (years > 0 && months > 0) return `${years} năm ${months} tháng`;
        if (years > 0) return `${years} năm`;
        return `${months} tháng`;
      } else {
        if (years > 0 && months > 0) return `${years} yr ${months} mo`;
        if (years > 0) return `${years} yr`;
        return `${months} mo`;
      }
    },
    [lang]
  );

  const timelineData = useMemo(() => {
    return experiences.map((exp) => ({
      ...exp,
      period: formatPeriod(exp.start_time, exp.end_time),
      duration: getDuration(exp.start_time, exp.end_time),
    }));
  }, [experiences, formatPeriod, getDuration]);

  return (
    <section id="experience" className="section experience-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t.experience.tag}</span>
        </FadeSection>

        <RevealText className="section-heading" delay={0.1}>
          {heading}
        </RevealText>

        {loading ? (
          <p className="section-loading">
            {lang === "vi" ? "Đang tải…" : "Loading…"}
          </p>
        ) : (
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
        )}
      </div>
    </section>
  );
}