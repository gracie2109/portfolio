"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export default function AnimatedName({ text, delay = 0.5 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const letters = text.split("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3, rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="hero-name"
      style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", perspective: "800px" }}
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          className={`hero-letter ${isInView ? "hero-letter--visible" : ""}`}
          style={{
            display: "inline-block",
            whiteSpace: letter === " " ? "pre" : "normal",
            "--letter-delay": `${delay + i * 0.04}s`,
          } as CSSProperties}
        >
          {letter === " " ? " " : letter}
        </span>
      ))}
    </div>
  );
}
