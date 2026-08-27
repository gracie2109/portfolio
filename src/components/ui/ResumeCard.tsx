"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./ResumeCard.module.css";
import { downloadFile } from "../../../utils/file";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false },
);

// Icons
const ViewIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

interface ResumeCardProps {
  title: string;
  link: string;
  lang?: string;
  viewLabel?: string;
  downloadLabel?: string;
  onView?: () => void;
}

/**
 * Resume Card Component — skeleton preview style
 */
export default function ResumeCard({
  title,
  link,
  lang = "en",
  viewLabel = "Xem",
  downloadLabel = "Tải xuống",
  onView,
}: ResumeCardProps) {
  const handleView = () => {
    if (onView) {
      onView();
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = () => {
    if (!link) return;
    downloadFile(
      link,
      `Trinh_Phuong_Thao_Webdev_${title.replace(/\s+/g, "_")}.pdf`,
    );
  };
  const badge = lang === "vi" ? "VI" : "EN";

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Skeleton preview */}
      <div className={styles.preview}>
        <span
          className={`${styles.badge} ${lang === "vi" ? styles.badgeVi : styles.badgeEn}`}
        >
          {badge}
        </span>
        <DotLottieReact src="/previewResume.lottie" loop autoplay />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <span className={styles.label}>{title}</span>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnView}`}
            onClick={handleView}
          >
            <ViewIcon />
            {viewLabel}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDownload}`}
            onClick={handleDownload}
          >
            <DownloadIcon />
            {downloadLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
