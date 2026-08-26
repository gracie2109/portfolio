"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import CustomCursor from "../ui/CustomCursor";
import ParticleField from "../animation/ParticleField";
import "../../App.css";

export default function PageShell({ children }: { children: ReactNode }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className="app">
      <CustomCursor />
      <ParticleField />

      {/* Progress Bar */}
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} />

      {children}
    </div>
  );
}
