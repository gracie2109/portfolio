import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import { useTranslation } from "react-i18next";
import { usePublicData } from "../../hooks/usePublicData";
import { localizeField } from "../../i18n/localize";
import { formatPeriod, getDuration } from "../../utils/experienceDuration";

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

export default function Experience() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: experiences = [], loading } = usePublicData("experiences", {
    orderBy: "start_time",
    ascending: false,
  });

  const heading = useMemo(() => {
    const parts = t("experience.heading").split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t("experience.headingAccent")}</span>
        {parts[1]}
      </>
    );
  }, [t]);

  const timelineData = useMemo(() => {
    return experiences.map((exp) => ({
      ...exp,
      period: formatPeriod(exp.start_time, exp.end_time, lang),
      duration: getDuration(exp.start_time, exp.end_time, lang),
    }));
  }, [experiences, lang]);

  return (
    <section id="experience" className="section experience-section">
      <div className="section-inner">
        <FadeSection>
          <span className="section-tag">{t("experience.tag")}</span>
        </FadeSection>

        <RevealText className="section-heading" delay={0.1}>
          {heading}
        </RevealText>

        {loading ? (
          <p className="section-loading">
            {t("common.loading")}
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
