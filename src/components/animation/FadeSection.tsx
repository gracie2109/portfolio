"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function FadeSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "-30px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isInView]);

  return (
    <div
      ref={ref}
      className={`fade-section ${className ?? ""} ${isInView ? "fade-section--visible" : ""}`}
      style={{ transitionDelay: isInView ? `${delay}s` : "0s" }}
    >
      {children}
    </div>
  );
}
