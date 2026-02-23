import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useLanguage } from "../../i18n/useLanguage";
import logo from "../../assets/plant.lottie";

const NAV_KEYS = ["about", "skills", "projects", "experience", "contact", "resume"];

const NAV_LINK_TRANSITIONS = NAV_KEYS.map((_, i) => ({
  delay: 0.7 + i * 0.1,
}));

const HOVER_STYLE = { y: -2 };
const INITIAL_LINK = { opacity: 0, y: -20 };
const ANIMATE_LINK = { opacity: 1, y: 0 };

const NavClock = memo(() => {
  const [time, setTime] = useState(() => new Date()); 

  useEffect(() => {
    const tick = () => setTime(new Date());
    const delay = 1000 - (Date.now() % 1000);

    let intervalId;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000); 
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId); 
    };
  }, []);

  return (
    <div className="nav-time">
      {time.toLocaleTimeString("en-US", TIME_FORMAT)}
    </div>
  );
});

const TIME_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

NavClock.displayName = "NavClock";

const OBSERVER_OPTIONS = { threshold: 0.3 };

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("");

  const handleIntersect = useCallback((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.id);
        break; 
      }
    }
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(handleIntersect, OBSERVER_OPTIONS);
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [handleIntersect]);

  return activeSection;
}

const NavLink = memo(({ navKey, label, isActive, index }) => (
  <motion.a
    href={`#${navKey}`}
    className={`nav-link ${isActive ? "active" : ""}`}
    initial={INITIAL_LINK}
    animate={ANIMATE_LINK}
    transition={NAV_LINK_TRANSITIONS[index]} 
    whileHover={HOVER_STYLE}
  >
    {label}
  </motion.a>
));

NavLink.displayName = "NavLink";

export default function Navbar() {
  const { t } = useLanguage();
  const activeSection = useActiveSection();

  const navLabels = useMemo(() => NAV_KEYS.map((key) => t.nav[key]), [t]);

  return (
    <motion.nav
      className="nav"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={NAV_TRANSITION}
    >
      <div className="nav-logo">
        <DotLottieReact src={logo} loop autoplay />
        <p>Grace</p>
      </div>

      <div className="nav-links">
        {NAV_KEYS.map((key, i) => (
          <NavLink
            key={key}
            navKey={key}
            label={navLabels[i]}
            isActive={activeSection === key}
            index={i}
          />
        ))}
      </div>

      <div className="nav-right">
        <LanguageSwitcher />
        <NavClock />
      </div>
    </motion.nav>
  );
}

const NAV_TRANSITION = { duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] };