import { useMemo } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import styles from "./SkillOrb.module.css";
import { capitalizeFirstLetter } from "../../../utils/string";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: Math.min(i * 0.04, 0.4),
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function SkillOrb({
  skill,
  index,
  isPlainIcon = false,
  style,
  typeLabel,
}) {
  // Detect icon type
  const isSvgString = useMemo(() => {
    return (
      typeof skill.icon === "string" && skill.icon.trim().startsWith("<svg")
    );
  }, [skill.icon]);

  const isImageUrl = useMemo(() => {
    return (
      typeof skill.icon === "string" &&
      (skill.icon.startsWith("http") ||
        skill.icon.startsWith("/") ||
        skill.icon.endsWith(".png") ||
        skill.icon.endsWith(".jpg") ||
        skill.icon.endsWith(".webp"))
    );
  }, [skill.icon]);

  const renderIcon = (className) => (
    <span className={className} style={{ ...(style ?? {}) }}>
      {isSvgString ? (
        <span
          className="skill-svg"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(skill.icon),
          }}
        />
      ) : isImageUrl ? (
        <img src={skill.icon} alt={skill.name} />
      ) : (
        skill.icon
      )}
    </span>
  );

  /* Plain icon mode — no card wrapper */
  if (isPlainIcon) {
    return renderIcon("skill-icon-small");
  }

  return (
    <motion.div
      className={styles.card}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{
        scale: 1.04,
        boxShadow:
          "0 8px 32px rgba(147, 130, 255, 0.18), 0 0 0 1px rgba(147, 130, 255, 0.12)",
        transition: { duration: 0.3 },
      }}
    >
      {/* Default content (fades on hover) */}
      {renderIcon(styles.icon)}
      <span className={styles.name}>{skill.name}</span>
      {typeLabel && <span className={styles.typeLabel}>{typeLabel}</span>}

      {/* Hover overlay — slide-up detail */}
      <div className={styles.overlay}>
        {/* {renderIcon(styles.overlayIcon)} */}
        {/* {renderIcon(styles.overlayIcon)}
        <span className={styles.overlayName}>{skill.name}</span>
        {typeLabel && <span className={styles.overlayBadge}>{typeLabel}</span>} */}
        {skill.description && (
          <span className={styles.overlayDesc}>
            {capitalizeFirstLetter(skill.description)}
          </span>
        )}
        <a
          href={skill?.link}
          target="_blank"
          style={{
            position: "absolute",
            // right: "0.25rem",
            // top: "0.75rem",
            bottom: 0,
            cursor: "pointer",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.2em"
            height="1.2em"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="#1494c1"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
