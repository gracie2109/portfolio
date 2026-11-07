"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";

interface Project {
  emoji?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "-30px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      className={`project-card ${isInView ? "project-card--visible" : ""}`}
      style={{ transitionDelay: isInView ? `${index * 0.15}s` : "0s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div
        className="project-card-inner"
        style={{ "--mouse-x": `${mousePos.x}px`, "--mouse-y": `${mousePos.y}px` } as CSSProperties}
      >
        <div className="project-number">0{index + 1}</div>
        <div className="project-emoji">{project.emoji}</div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {project.tags?.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className={`project-glow ${hovered ? "project-glow--visible" : ""}`} />
        <div className="project-spotlight" />
      </div>
    </div>
  );
}
