"use client";

import { useEffect, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import CustomCursor from "../ui/CustomCursor";
import "../../App.css";

const ParticleField = dynamic(() => import("../animation/ParticleField"), {
  ssr: false,
});

export default function PageShell({ children }: { children: ReactNode }) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="app">
      <CustomCursor />
      <ParticleField />

      {/* Progress Bar */}
      <div ref={progressRef} className="scroll-progress" />

      {children}
    </div>
  );
}
