import { useRef, useCallback } from "react";

const HREF_PREFIX = {
  normal: "",
  mail: "mailto:",
  phone: "tel:",
};

export default function MagneticButton({
  children,
  className = "",
  onClick,
  href,
  data_type = "normal",
}) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  }, []);

  const Tag = href ? "a" : "button";

  const prefix = HREF_PREFIX[data_type] ?? "";
  const resolvedHref = href ? `${prefix}${href}` : undefined;

  return (
    <Tag
      ref={ref}
      className={`magnetic-btn ${className}`.trim()}
      style={{ transition: "transform 0.3s ease" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      href={resolvedHref}
      {...(data_type === "normal" && href
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </Tag>
  );
}