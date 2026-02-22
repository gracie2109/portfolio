import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/useLanguage";

export default function MarqueeText() {
  const { t } = useLanguage();

  return (
    <div className="marquee-container">
      <motion.div
        className="marquee-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(2)].map((_, i) => (
          <span key={i} className="marquee-text">
            {t.marquee}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
