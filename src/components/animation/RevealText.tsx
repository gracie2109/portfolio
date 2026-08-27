"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function RevealText({
  children,
  className,
  delay = 0,
  alwaysAnimate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  alwaysAnimate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
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

  const shouldAnimate = alwaysAnimate || isInView;

  return (
    <div ref={ref} className="reveal-wrap">
      <div
        className={`reveal-text ${className ?? ""} ${shouldAnimate ? "reveal-text--visible" : ""}`}
        style={{ transitionDelay: shouldAnimate ? `${delay}s` : "0s" }}
      >
        {children}
      </div>
    </div>
  );
}
