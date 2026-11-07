"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export default function AnimatedName({ text, delay = 0.5 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);

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

  // Group letters per word so a line can only wrap between words.
  let letterIndex = 0;
  const words = text.split(" ").map((word) =>
    word.split("").map((letter) => ({ letter, index: letterIndex++ }))
  );

  return (
    <span ref={ref} className="hero-name">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="hero-word">
          {word.map(({ letter, index }) => (
            <span
              key={index}
              className={`hero-letter ${isInView ? "hero-letter--visible" : ""}`}
              style={{
                display: "inline-block",
                "--letter-delay": `${delay + index * 0.04}s`,
              } as CSSProperties}
            >
              {letter}
            </span>
          ))}
          {wordIndex < words.length - 1 && <span className="hero-space"> </span>}
        </span>
      ))}
    </span>
  );
}
