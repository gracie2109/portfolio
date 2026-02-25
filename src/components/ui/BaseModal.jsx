import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BaseModal.module.css";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

/**
 * Reusable BaseModal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {() => void} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {number|string} [props.maxWidth=900] - Max width of modal
 */
export default function BaseModal({
  isOpen,
  onClose,
  children,
  maxWidth = 900,
}) {
  // ESC key handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Click outside handler
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modalStyle = {
    maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={styles.modal}
            style={modalStyle}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
