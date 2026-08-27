"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3, rootMargin: "-30px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer">
      <div
        ref={ref}
        className={`footer-inner ${isInView ? "footer-inner--visible" : ""}`}
      >
        <p>{t("footer.line1")}</p>
        <p className="footer-year">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
