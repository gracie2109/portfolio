import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BaseModal from "./BaseModal";
import ResumeCard from "./ResumeCard";
import { supabase } from "../../lib/supabaseClient";
import { useLanguage } from "../../i18n/useLanguage";
import styles from "./ResumePreviewModal.module.css";
import { downloadFile } from "../../../utils/file";

// Icons
const FileIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BackIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

const FullscreenIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15,3 21,3 21,9" />
    <polyline points="9,21 3,21 3,15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* slide variants for content switching */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

/**
 * Resume Preview Modal with dual language support
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function ResumePreviewModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [resumes, setResumes] = useState({ en: null, vi: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalContentRef = useRef(null);

  // Preview state: null = card list, { link, title } = PDF viewer
  const [preview, setPreview] = useState(null);
  const [slideDir, setSlideDir] = useState(1);

  // Reset preview when modal closes
  useEffect(() => {
    if (!isOpen) setPreview(null);
  }, [isOpen]);

  // Fetch resumes from Supabase
  const fetchResumes = useCallback(async () => {
    if (!supabase) {
      setError("Supabase not configured");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("resume")
        .select("*");

      if (fetchError) throw fetchError;

      const resumeMap = { en: null, vi: null };
      data?.forEach((item) => {
        if (item.name === "en" || item.name === "vi") {
          resumeMap[item.name] = item;
        }
      });

      setResumes(resumeMap);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError(err.message || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen, fetchResumes]);

  // Open PDF preview inside modal
  const handleView = (link, title) => {
    setSlideDir(1);
    setPreview({ link, title });
  };

  // Go back to card list
  const handleBack = () => {
    setSlideDir(-1);
    setPreview(null);
  };

  // Fullscreen handler
  const handleFullscreen = () => {
    // if (preview) {
    //   window.open(preview.link, "_blank");
    //   return;
    // }
    const content = modalContentRef.current;
    if (!content) return;
    if (content.requestFullscreen) content.requestFullscreen();
    else if (content.webkitRequestFullscreen) content.webkitRequestFullscreen();
  };

  // Download handler for preview mode
  const handleDownload = () => {
  if (!preview?.link) return;

  downloadFile(
    preview.link,
   `Trinh_Phuong_Thao_Webdev_${preview.title.replace(/\s+/g, "_")}.pdf`
  );
};

  const labels = {
    title: t.resume?.modalTitle ?? "Resume Preview",
    english: t.resume?.englishVersion ?? "English Version",
    vietnamese: t.resume?.vietnameseVersion ?? "Vietnamese Version",
    view: t.resume?.viewLabel ?? "Xem",
    download: t.resume?.downloadLabel ?? "Tải xuống",
    fullscreen: t.resume?.fullscreenBtn ?? "View Fullscreen",
    back: t.resume?.backBtn ?? "Quay lại",
    loading: t.resume?.loading ?? "Loading...",
    error: t.resume?.errorMessage ?? "Failed to load resumes",
    noData: t.resume?.noData ?? "No resume available",
  };

  const headerTitle = preview ? preview.title : labels.title;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth={1200}>
      <div className={styles.container} ref={modalContentRef}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {preview ? (
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
                aria-label="Back"
              >
                <BackIcon />
              </button>
            ) : (
              <span className={styles.icon}>
                <FileIcon />
              </span>
            )}
            <h3 className={styles.title}>{headerTitle}</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body — animated content switch */}
        <div className={styles.body}>
          <AnimatePresence mode="wait" custom={slideDir}>
            {preview ? (
              <motion.div
                key="pdf-viewer"
                className={styles.pdfViewer}
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <iframe
                  src={`${preview.link}#toolbar=0&navpanes=0`}
                  className={styles.iframe}
                  title={`${preview.title} Preview`}
                />
              </motion.div>
            ) : (
              <motion.div
                key="card-list"
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {loading && (
                  <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>{labels.loading}</span>
                  </div>
                )}

                {error && (
                  <div className={styles.error}>
                    <span>{labels.error}</span>
                    <button
                      type="button"
                      className={styles.retryBtn}
                      onClick={fetchResumes}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !error && (
                  <div className={styles.grid}>
                    {resumes.en ? (
                      <ResumeCard
                        title={labels.english}
                        link={resumes.en.link}
                        lang="en"
                        viewLabel={labels.view}
                        downloadLabel={labels.download}
                        onView={() =>
                          handleView(resumes.en.link, labels.english)
                        }
                      />
                    ) : (
                      <div className={styles.placeholder}>
                        <span>{labels.noData}</span>
                      </div>
                    )}

                    {resumes.vi ? (
                      <ResumeCard
                        title={labels.vietnamese}
                        link={resumes.vi.link}
                        lang="vi"
                        viewLabel={labels.view}
                        downloadLabel={labels.download}
                        onView={() =>
                          handleView(resumes.vi.link, labels.vietnamese)
                        }
                      />
                    ) : (
                      <div className={styles.placeholder}>
                        <span>{labels.noData}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {preview && (
            <motion.button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DownloadIcon />
              {labels.download}
            </motion.button>
          )}
          <motion.button
            type="button"
            className={styles.fullscreenBtn}
            onClick={handleFullscreen}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FullscreenIcon />
            {labels.fullscreen}
          </motion.button>
        </div>
      </div>
    </BaseModal>
  );
}
