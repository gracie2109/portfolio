import { motion, useScroll, useTransform } from "framer-motion";
import RevealText from "../animation/RevealText";
import AnimatedName from "../animation/AnimatedName";
import MagneticButton from "../ui/MagneticButton";
import { useLanguage } from "../../i18n/useLanguage";
import RedoAnimText from "../animation/TypeText";

export default function Hero() {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 0.12], [0, -80]);

  /* Parse subtitle template: "I craft {accent} that..." */
  const renderSubtitle = () => {
    const parts = t.hero.subtitle.split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t.hero.subtitleAccent}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <motion.section
      className="hero"
      style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
    >
      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6, type: "spring" }}
        >
          <span className="badge-dot" /> {t.hero.badge}
        </motion.div>

        <div className="hero-title-wrap">
          <RevealText className="hero-greeting" delay={0.3} alwaysAnimate>
            {t.hero.greeting}
          </RevealText>
          <RevealText className="hero-greeting" delay={0.3} alwaysAnimate>
            <AnimatedName text={t.hero.name} delay={0.6} />
            {/* <span>( Grace )</span> */}
            <RedoAnimText  AnimatedName texts={["aka GRACE"]} delay={0.8} />
          </RevealText>
          <RevealText className="hero-subtitle" delay={1.4} alwaysAnimate>
            {renderSubtitle()}
          </RevealText>
        </div>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <a href="#contact" className="btn-primary">
            <span>{t.hero.btnConnect}</span>
            <span className="btn-arrow">→</span>
          </a>
          <a className="btn-outline" href="#projects">
            <span>{t.hero.btnWork}</span>
          </a>
        </motion.div>

        {/* <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="scroll-line"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <span>{t.hero.scrollHint}</span>
        </motion.div> */}
      </div>
    </motion.section>
  );
}
