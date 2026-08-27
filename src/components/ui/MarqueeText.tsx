"use client";

import { useTranslation } from "react-i18next";

export default function MarqueeText() {
  const { t } = useTranslation();

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {[...Array(2)].map((_, i) => (
          <span key={i} className="marquee-text">
            {t("marquee")}
          </span>
        ))}
      </div>
    </div>
  );
}
