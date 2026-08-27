"use client";

import { useState, useEffect, useMemo, memo, useCallback, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false },
);

const NAV_KEYS = ["about", "skills", "experience", "contact", "resume"];

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const NavClock = memo(() => {
  // Starts null so server and client render the same markup on the
  // first pass — `new Date()` would differ by the seconds elapsed
  // between server render and client hydration, causing a mismatch.
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date());
    tick();
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
      {time ? time.toLocaleTimeString("en-US", TIME_FORMAT) : null}
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
  onClick?: () => void;
}

const NavLink = memo(({ navKey, label, isActive, index, onClick }: NavLinkProps) => (
  <a
    href={`#${navKey}`}
    className={`nav-link ${isActive ? "active" : ""}`}
    style={{ "--nav-link-delay": `${0.7 + index * 0.1}s` } as CSSProperties}
    onClick={onClick}
  >
    {label}
  </a>
));

NavLink.displayName = "NavLink";

export default function Navbar() {
  const { t } = useTranslation();
  const activeSection = useActiveSection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLabels = useMemo(() => NAV_KEYS.map((key) => t(`nav.${key}`)), [t]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <nav className="nav nav--enter">
      <a href="#" className="nav-logo" aria-label="Trang chủ">
        <DotLottieReact src="/plant.lottie" loop autoplay />
      </a>

      <div className={`nav-links ${isMenuOpen ? "nav-links--open" : ""}`}>
        {NAV_KEYS.map((key, i) => (
          <NavLink
            key={key}
            navKey={key}
            label={navLabels[i]}
            isActive={activeSection === key}
            index={i}
            onClick={closeMenu}
          />
        ))}
      </div>

      <div className="nav-right">
        <NavClock />
        <button
          type="button"
          className={`nav-toggle ${isMenuOpen ? "nav-toggle--open" : ""}`}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isMenuOpen && <div className="nav-overlay" onClick={closeMenu} />}
    </nav>
  );
}
