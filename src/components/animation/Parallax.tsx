"use client";

import { useEffect } from "react";

/**
 * Scroll parallax for the whole page, driven by one rAF-throttled listener.
 *
 * Each target is shifted by (viewportCenter - elementCenter) * speed:
 * positive speeds lag behind the scroll (background feel), negative speeds
 * run ahead of it (foreground feel). Only `transform` is written, so it
 * never triggers layout. Disabled for prefers-reduced-motion.
 */
const TARGETS: Array<[selector: string, speed: number]> = [
  [".parallax-orb--1", 0.45],
  [".parallax-orb--2", 0.25],
  [".parallax-orb--3", -0.2],
  [".parallax-orb--4", 0.35],
  [".hero-visual", 0.3],
  [".hero-content", -0.08],
  [".section-tag", 0.22],
  [".section-inner > .reveal-wrap", 0.1],
];

export function ParallaxBackdrop() {
  return (
    <div className="parallax-backdrop" aria-hidden="true">
      <span className="parallax-orb parallax-orb--1" />
      <span className="parallax-orb parallax-orb--2" />
      <span className="parallax-orb parallax-orb--3" />
      <span className="parallax-orb parallax-orb--4" />
    </div>
  );
}

export default function ParallaxController() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const offsets = new WeakMap<HTMLElement, number>();
    let items: Array<{ el: HTMLElement; speed: number }> = [];
    let ticking = false;

    const collect = () => {
      items = TARGETS.flatMap(([selector, speed]) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)).map((el) => ({ el, speed })),
      );
    };

    const update = () => {
      ticking = false;
      const viewportCenter = window.innerHeight / 2;
      for (const { el, speed } of items) {
        const rect = el.getBoundingClientRect();
        const current = offsets.get(el) ?? 0;
        // Center of the element without our own translate applied.
        const center = rect.top - current + rect.height / 2;
        const distance = viewportCenter - center;
        // Skip elements far off-screen.
        if (Math.abs(distance) > window.innerHeight * 1.5) continue;
        const next = distance * speed;
        offsets.set(el, next);
        el.style.translate = `0 ${next.toFixed(1)}px`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    collect();
    update();
    // Sections render client pieces after hydration; re-collect once settled.
    const recollectId = window.setTimeout(() => {
      collect();
      update();
    }, 1200);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(recollectId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      for (const { el } of items) el.style.translate = "";
    };
  }, []);

  return null;
}
