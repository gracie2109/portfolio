"use client";

import { useRef, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
}

// Grid cell size for spatial bucketing — must be >= CONNECTION_DIST so
// only adjacent cells can possibly contain a connectable neighbor.
const CONNECTION_DIST = 150;
const PARTICLE_COUNT = 60;

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.current.push({
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // Bucket particles into a spatial grid each frame so connection
    // checks only compare each particle against neighbors in its own
    // and adjacent cells, instead of every other particle (O(n^2)).
    const grid = new Map<string, Particle[]>();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      grid.clear();
      const cols = Math.ceil(w / CONNECTION_DIST);
      const cellOf = (p: Particle) => {
        const cx = Math.floor(p.x / CONNECTION_DIST);
        const cy = Math.floor(p.y / CONNECTION_DIST);
        return cy * cols + cx;
      };

      for (const p of particles.current) {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const key = String(cellOf(p));
        const bucket = grid.get(key);
        if (bucket) bucket.push(p);
        else grid.set(key, [p]);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 130, 255, ${p.opacity})`;
        ctx.fill();
      }

      for (const p of particles.current) {
        const cx = Math.floor(p.x / CONNECTION_DIST);
        const cy = Math.floor(p.y / CONNECTION_DIST);

        for (let ny = cy - 1; ny <= cy + 1; ny++) {
          for (let nx = cx - 1; nx <= cx + 1; nx++) {
            const neighbors = grid.get(String(ny * cols + nx));
            if (!neighbors) continue;

            for (const p2 of neighbors) {
              if (p2.id <= p.id) continue;
              const cdx = p.x - p2.x;
              const cdy = p.y - p2.y;
              const cd = Math.hypot(cdx, cdy);
              if (cd < CONNECTION_DIST) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(147, 130, 255, ${0.15 * (1 - cd / CONNECTION_DIST)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    // Defer starting the animation loop until the browser is idle so it
    // doesn't compete with the main thread during initial paint/LCP.
    const idleId = ("requestIdleCallback" in window
      ? window.requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 200))(() => {
      draw();
    });

    return () => {
      if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as unknown as number);
      }
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}
