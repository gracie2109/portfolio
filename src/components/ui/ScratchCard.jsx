import React, { useRef, useState, useEffect, useCallback } from "react";

const SCRATCH_RADIUS = 26;
const REVEAL_THRESHOLD = 0.35;
const GRID = 20;

/* ── Draw the textured overlay ── */
function paintOverlay(canvas, width, height, overlayTheme) {
  const ctx = canvas.getContext("2d");
  const {
    colors = ["#1a1a2e", "#16213e", "#0f3460"],
    accentColor = "#9382ff",
    texts = ["?", "✦", "★", "✿", "♦"],
    label = "SCRATCH ME",
  } = overlayTheme;

  // 1) Rich gradient background
  const grad = ctx.createLinearGradient(0, 0, width * 0.3, height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2) Shimmer highlight — diagonal light streak
  const shimmer = ctx.createLinearGradient(0, 0, width, height * 0.6);
  shimmer.addColorStop(0, "rgba(255,255,255,0)");
  shimmer.addColorStop(0.4, "rgba(255,255,255,0.06)");
  shimmer.addColorStop(0.5, "rgba(255,255,255,0.12)");
  shimmer.addColorStop(0.6, "rgba(255,255,255,0.06)");
  shimmer.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, width, height);

  // 3) Diamond cross-hatch pattern
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 0.8;
  const spacing = 24;
  for (let i = -height; i < width + height; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i + height, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  ctx.restore();

  // 4) Scattered decorative symbols — larger & more visible
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 16; i++) {
    const sx = 20 + Math.random() * (width - 40);
    const sy = 20 + Math.random() * (height - 40);
    const size = 12 + Math.random() * 16;
    const alpha = 0.1 + Math.random() * 0.12;
    ctx.font = `${size}px sans-serif`;
    ctx.fillStyle = `rgba(180,170,255,${alpha})`;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Math.random() * Math.PI * 2);
    ctx.fillText(texts[i % texts.length], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // 5) Sparkle dots — brighter
  for (let i = 0; i < 30; i++) {
    const dx = Math.random() * width;
    const dy = Math.random() * height;
    const r = 0.8 + Math.random() * 1.8;
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,190,255,${0.15 + Math.random() * 0.2})`;
    ctx.fill();
  }

  // 6) Center icon — large finger/hand emoji
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "42px sans-serif";
  ctx.fillText("👆", width / 2, height / 2 - 20);
  ctx.restore();

  // 7) Center label — bold and clear
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 15px 'Space Grotesk', 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(label, width / 2, height / 2 + 24);

  // Decorative line under label
  const lw = 80;
  const lineY = height / 2 + 40;
  const lineGrad = ctx.createLinearGradient(width / 2 - lw / 2, 0, width / 2 + lw / 2, 0);
  lineGrad.addColorStop(0, "rgba(147,130,255,0)");
  lineGrad.addColorStop(0.3, accentColor);
  lineGrad.addColorStop(0.7, accentColor);
  lineGrad.addColorStop(1, "rgba(147,130,255,0)");
  ctx.strokeStyle = lineGrad;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - lw / 2, lineY);
  ctx.lineTo(width / 2 + lw / 2, lineY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // 8) Vignette border — softer
  const vg = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.72
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);

  // 9) Border frame — accent glow
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 8;
  const pad = 10;
  const r2 = 8;
  ctx.beginPath();
  ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, r2);
  ctx.stroke();
  ctx.restore();

  // 10) Corner decorations
  ctx.save();
  ctx.fillStyle = `rgba(147,130,255,0.3)`;
  const cs = 5;
  const cp = 18;
  // top-left
  ctx.beginPath(); ctx.arc(cp, cp, cs, 0, Math.PI * 2); ctx.fill();
  // top-right
  ctx.beginPath(); ctx.arc(width - cp, cp, cs, 0, Math.PI * 2); ctx.fill();
  // bottom-left
  ctx.beginPath(); ctx.arc(cp, height - cp, cs, 0, Math.PI * 2); ctx.fill();
  // bottom-right
  ctx.beginPath(); ctx.arc(width - cp, height - cp, cs, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * ScratchCard — native Canvas scratch overlay with textured design.
 *
 * Props:
 *  - width / height  : card dimensions (px)
 *  - disabled        : prevent scratching
 *  - onReveal        : callback when >= 35% scratched
 *  - overlayTheme    : { colors, accentColor, texts, label }
 *  - children        : content rendered underneath
 */
export default function ScratchCard({
  width = 260,
  height = 340,
  disabled = false,
  onReveal,
  overlayTheme = {},
  children,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const revealedRef = useRef(false);
  const cellsRef = useRef(new Set());
  const totalCells = GRID * GRID;
  const lastPosRef = useRef(null);

  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Paint textured overlay on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paintOverlay(canvas, width, height, overlayTheme);
  }, [width, height, overlayTheme]);

  const markCell = useCallback(
    (x, y) => {
      const cx = Math.floor((x / width) * GRID);
      const cy = Math.floor((y / height) * GRID);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
            cellsRef.current.add(`${nx},${ny}`);
          }
        }
      }
    },
    [width, height]
  );

  const checkReveal = useCallback(() => {
    const pct = cellsRef.current.size / totalCells;
    setProgress(Math.min(pct / REVEAL_THRESHOLD, 1));
    if (pct >= REVEAL_THRESHOLD && !revealedRef.current) {
      revealedRef.current = true;
      setRevealed(true);
      onReveal?.();
    }
  }, [totalCells, onReveal]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const scratch = useCallback(
    (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "destination-out";

      // Interpolate between last and current position for smooth strokes
      const last = lastPosRef.current;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(dist / (SCRATCH_RADIUS * 0.4)));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const ix = last.x + dx * t;
          const iy = last.y + dy * t;
          ctx.beginPath();
          ctx.arc(ix, iy, SCRATCH_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          markCell(ix, iy);
        }
      } else {
        ctx.beginPath();
        ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        markCell(x, y);
      }

      lastPosRef.current = { x, y };
      ctx.globalCompositeOperation = "source-over";
    },
    [markCell]
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (disabled || revealedRef.current) return;
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = null; // reset interpolation
      const pos = getPos(e);
      if (pos) scratch(pos.x, pos.y);
    },
    [disabled, getPos, scratch]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDrawingRef.current || disabled || revealedRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      if (pos) {
        scratch(pos.x, pos.y);
        checkReveal();
      }
    },
    [disabled, getPos, scratch, checkReveal]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      checkReveal();
    }
  }, [checkReveal]);

  // Attach touch/mouse listeners to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts = { passive: false };

    canvas.addEventListener("mousedown", handlePointerDown, opts);
    canvas.addEventListener("mousemove", handlePointerMove, opts);
    window.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("touchstart", handlePointerDown, opts);
    canvas.addEventListener("touchmove", handlePointerMove, opts);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return (
    <div
      className="scratch-card-wrapper"
      style={{ width, height, position: "relative" }}
    >
      {/* Content underneath */}
      <div className="scratch-card-content" style={{ width, height }}>
        {children}
      </div>

      {/* Native canvas scratch overlay */}
      <div
        className={`scratch-overlay ${revealed ? "scratch-revealed" : ""}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          borderRadius: "inherit",
          overflow: "hidden",
          pointerEvents: disabled || revealed ? "none" : "auto",
          opacity: revealed ? 0 : 1,
          transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: disabled ? "default" : "pointer",
          }}
        />
      </div>

      {/* Progress bar */}
      {!revealed && !disabled && (
        <div className="scratch-progress-bar">
          <div
            className="scratch-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
