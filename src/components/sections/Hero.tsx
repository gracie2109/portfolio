"use client";

import { useEffect, useRef } from "react";
import RevealText from "../animation/RevealText";
import AnimatedName from "../animation/AnimatedName";
import { useTranslation } from "react-i18next";
import RedoAnimText from "../animation/TypeText";

export default function Hero() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);

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
    <section className="hero" ref={heroRef}>
      <div className="hero-content">
        <div className="hero-badge hero-badge--enter">
          <span className="badge-dot" /> {t("hero.badge")}
        </div>

        <div className="hero-title-wrap">
          <RevealText className="hero-greeting" delay={0.1} alwaysAnimate>
            {t("hero.greeting")}
          </RevealText>
          <RevealText className="hero-greeting" delay={0.1} alwaysAnimate>
            <AnimatedName text={t("hero.name")} delay={0.2} />
            <RedoAnimText texts={["aka GRACE"]} delay={0.3} />
          </RevealText>
          <RevealText className="hero-subtitle" delay={0.15} alwaysAnimate>
            {renderSubtitle()}
          </RevealText>
        </div>

        <div className="hero-cta hero-cta--enter">
          <a href="#contact" className="btn-primary">
            <span>{t("hero.btnConnect")}</span>
            <span className="btn-arrow">→</span>
          </a>
          <a className="btn-outline" href="#projects">
            <span>{t("hero.btnWork")}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
