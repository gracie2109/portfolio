"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { motion, type Transition } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const NAV_KEYS = ["about", "skills", "experience", "contact", "resume"];

const NAV_LINK_TRANSITIONS = NAV_KEYS.map((_, i) => ({
  delay: 0.7 + i * 0.1,
}));

const HOVER_STYLE = { y: -2 };
const INITIAL_LINK = { opacity: 0, y: -20 };
const ANIMATE_LINK = { opacity: 1, y: 0 };

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const NavClock = memo(() => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setTime(new Date());
    const delay = 1000 - (Date.now() % 1000);

    let intervalId: ReturnType<typeof setInterval>;
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

NavClock.displayName = "NavClock";

const OBSERVER_OPTIONS = { threshold: 0.3 };

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("");

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
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

interface NavLinkProps {
  navKey: string;
  label: string;
  isActive: boolean;
  index: number;
}

const NavLink = memo(({ navKey, label, isActive, index }: NavLinkProps) => (
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

const NAV_TRANSITION: Transition = { duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] };

export default function Navbar() {
  const { t } = useTranslation();
  const activeSection = useActiveSection();

  const navLabels = useMemo(() => NAV_KEYS.map((key) => t(`nav.${key}`)), [t]);

  return (
    <motion.nav
      className="nav"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={NAV_TRANSITION}
    >
      <a href="#" className="nav-logo" >
        <DotLottieReact src="/plant.lottie" loop autoplay />
      </a>

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
