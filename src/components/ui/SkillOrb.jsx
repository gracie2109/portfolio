import { useMemo } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";

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

export default function SkillOrb({ skill, index, isPlainIcon = false, style, typeLabel }) {
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

  const content = () => {
    return (
      <>
        <span
          className={isPlainIcon ? "skill-icon-small" : "skill-icon"}
          style={{ ...(style ?? {}) }}
        >
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
      </>
    );
  };
  return !isPlainIcon ? (
    <motion.div
      className="skill-orb"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 24px rgba(147, 130, 255, 0.3)",
        transition: { duration: 0.2 },
      }}
    >
      {content()}

      <span className="skill-name">{skill.name}</span>
      {typeLabel && <span className="skill-type-label">{typeLabel}</span>}
    </motion.div>
  ) : (
    content()
  );
}
