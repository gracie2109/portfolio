"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import RevealText from "../animation/RevealText";
import AnimatedName from "../animation/AnimatedName";
import { useTranslation } from "react-i18next";
import RedoAnimText from "../animation/TypeText";
import { openResume } from "../../utils/resumeEvents";

const HeroScene = dynamic(() => import("../three/HeroScene"), { ssr: false });

/* 3D only where it is cheap and visible: wide screens, motion allowed. */
const SCENE_MEDIA_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

export interface HeroLink {
  href: string;
  label: string;
}

const HIGHLIGHT_SKILLS = ["React", "Next.js", "Vue", "TypeScript", "Node.js"];

export default function Hero({
  experienceYears,
  links = [],
}: {
  experienceYears: number;
  links?: HeroLink[];
}) {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(SCENE_MEDIA_QUERY);
    const sync = () => setShowScene(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      // Mirrors the previous scrollYProgress [0, 0.12] -> [1, 0] mapping.
      const t = Math.min(progress / 0.12, 1);
      const opacity = 1 - t;
      const scale = 1 - t * 0.08;
      const y = -t * 80;

      el.style.opacity = String(opacity);
      el.style.transform = `translateY(${y}px) scale(${scale})`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Parse subtitle template: "I craft {accent} that..." */
  const renderSubtitle = () => {
    const parts = t("hero.subtitle").split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t("hero.subtitleAccent")}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-content">
          <div className="hero-badge hero-badge--enter">
            <span className="badge-dot" /> {t("hero.badge")}
          </div>

          <div className="hero-title-wrap">
            <RevealText className="hero-greeting" delay={0.1} alwaysAnimate>
              {t("hero.greeting")}
            </RevealText>
            <RevealText as="h1" className="hero-heading" delay={0.1} alwaysAnimate>
              <span id="hero-title">
                <AnimatedName text={t("hero.name")} delay={0.2} />
              </span>
            </RevealText>
            <span className="hero-aka" aria-hidden="true">
              <RedoAnimText texts={["aka GRACE"]} delay={0.3} />
            </span>
            <p className="hero-role hero-cta--enter">
              <strong>{t("hero.role")}</strong>
              <span className="hero-role-sep" aria-hidden="true">•</span>
              {t("hero.experience", { years: experienceYears })}
            </p>
            <RevealText as="p" className="hero-subtitle" delay={0.15} alwaysAnimate>
              {renderSubtitle()}
            </RevealText>
          </div>

          <ul className="hero-skills hero-cta--enter" aria-label={t("hero.skillsLabel")}>
            {HIGHLIGHT_SKILLS.map((skill) => (
              <li key={skill} className="hero-skill">{skill}</li>
            ))}
          </ul>

          <div className="hero-cta hero-cta--enter">
            <a
              href="#resume"
              className="btn-primary"
              onClick={(event) => {
                event.preventDefault();
                openResume();
              }}
            >
              <span>{t("hero.btnCv")}</span>
              <span className="btn-arrow" aria-hidden="true">↓</span>
            </a>
            <a className="btn-outline" href="#contact">
              <span>{t("hero.btnConnect")}</span>
            </a>
          </div>

          {links.length > 0 && (
            <ul className="hero-links hero-cta--enter">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer me" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-glow" />
          {showScene && <HeroScene />}
        </div>
      </div>
    </section>
  );
}
