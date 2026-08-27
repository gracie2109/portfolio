"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SecretCVBox.css";

/* ── Icons ── */
const GiftIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="secret-cv__gift-icon">
    <rect x="6" y="22" width="40" height="26" rx="4" stroke="currentColor" strokeWidth="2.2" />
    <rect x="2" y="14" width="48" height="10" rx="3" stroke="currentColor" strokeWidth="2.2" />
    <path d="M26 14v34" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
    <path d="M26 14c-4-8-14-8-14 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M26 14c4-8 14-8 14 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

const StarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#c9a84c" strokeWidth="2.5" />
    <text x="24" y="31" textAnchor="middle" fill="#c9a84c" fontSize="22" fontFamily="inherit">✦</text>
  </svg>
);

const SadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#8a879a" strokeWidth="2.5" opacity=".5" />
    <text x="24" y="31" textAnchor="middle" fill="#8a879a" fontSize="20" fontFamily="inherit">🌧</text>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

/* ── States ── */
const BOX_STATE = {
  SEALED: "sealed",    // chưa chọn
  OPENING: "opening",  // đang mở (animation)
  WIN: "win",          // chứa resume
  MISS: "miss",        // trượt
  DISABLED: "disabled" // hết lượt
} as const;

export type BoxState = (typeof BOX_STATE)[keyof typeof BOX_STATE];

interface SecretCVBoxLabels {
  secret?: string;
  open?: string;
  found?: string;
  ohNo?: string;
  locked?: string;
}

interface SecretCVBoxProps {
  index?: number;
  state?: BoxState;
  missMessage?: string;
  labels?: SecretCVBoxLabels;
  onClick?: () => void;
  delay?: number;
}

/**
 * SecretCVBox — A mystery gift box for the Secret CV game.
 */
export default function SecretCVBox({
  index = 0,
  state = BOX_STATE.SEALED,
  missMessage = "",
  labels = {},
  onClick,
  delay = 0,
}: SecretCVBoxProps) {
  // showContent is a pure function of `state`, except OPENING which
  // delays the reveal by 900ms — needs a genuine effect for the timer,
  // and resets openingRevealed on every other transition so a later
  // re-OPENING starts from hidden again.
  const [openingRevealed, setOpeningRevealed] = useState(false);

  useEffect(() => {
    if (state !== BOX_STATE.OPENING) {
      // Resets derived UI state on the `state` prop transition, not a data sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpeningRevealed(false);
      return;
    }
    const timer = setTimeout(() => setOpeningRevealed(true), 900);
    return () => clearTimeout(timer);
  }, [state]);

  const showContent =
    state === BOX_STATE.WIN || state === BOX_STATE.MISS
      ? true
      : state === BOX_STATE.OPENING
        ? openingRevealed
        : false;

  const isSealed = state === BOX_STATE.SEALED;
  const isOpening = state === BOX_STATE.OPENING;
  const isWin = state === BOX_STATE.WIN;
  const isMiss = state === BOX_STATE.MISS;
  const isDisabled = state === BOX_STATE.DISABLED;
  const handleClick = () => {
    if (isSealed && onClick) onClick();
  };

  const boxNum = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      className={`secret-cv-box secret-cv-box--${state}`}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      onClick={handleClick}
      whileHover={isSealed ? { scale: 1.05, y: -8 } : {}}
      whileTap={isSealed ? { scale: 0.97 } : {}}
    >
      {/* Glow ring on hover (sealed only) */}
      {isSealed && <div className="secret-cv-box__glow" />}

      {/* Box number badge */}
      <span className="secret-cv-box__number">{boxNum}</span>

      {/* ── Inner content ── */}
      <div className="secret-cv-box__inner">
        <AnimatePresence mode="wait">
          {/* Sealed state */}
          {isSealed && (
            <motion.div
              key="sealed"
              className="secret-cv-box__sealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="secret-cv-box__icon-wrap">
                <GiftIcon />
              </div>
              <span className="secret-cv-box__label">{labels.secret || "SECRET CV"}</span>
              <span className="secret-cv-box__hint">{labels.open || "Chọn để mở"}</span>
            </motion.div>
          )}

          {/* Opening state — suspense animation */}
          {isOpening && !showContent && (
            <motion.div
              key="opening"
              className="secret-cv-box__opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="secret-cv-box__pulse-ring" />
              <div className="secret-cv-box__pulse-ring secret-cv-box__pulse-ring--2" />
              <div className="secret-cv-box__opening-icon">
                <GiftIcon />
              </div>
            </motion.div>
          )}

          {/* Win state */}
          {isWin && (
            <motion.div
              key="win"
              className="secret-cv-box__result secret-cv-box__result--win"
              initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            >
              <div className="secret-cv-box__light-burst" />
              <StarIcon />
              <span className="secret-cv-box__result-label secret-cv-box__result-label--win">
                {labels.found || "ĐÃ TÌM THẤY!"}
              </span>
            </motion.div>
          )}

          {/* Miss state */}
          {isMiss && (
            <motion.div
              key="miss"
              className="secret-cv-box__result secret-cv-box__result--miss"
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <SadIcon />
              <span className="secret-cv-box__result-label secret-cv-box__result-label--miss">
                {labels.ohNo || "ÔI KHÔNG"}
              </span>
              <span className="secret-cv-box__miss-msg">{missMessage}</span>
            </motion.div>
          )}

          {/* Disabled state */}
          {isDisabled && (
            <motion.div
              key="disabled"
              className="secret-cv-box__disabled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <LockIcon />
              <span className="secret-cv-box__label secret-cv-box__label--locked">
                {labels.locked || "ĐÃ KHÓA"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative corner dots */}
      <div className="secret-cv-box__corner secret-cv-box__corner--tl" />
      <div className="secret-cv-box__corner secret-cv-box__corner--tr" />
      <div className="secret-cv-box__corner secret-cv-box__corner--bl" />
      <div className="secret-cv-box__corner secret-cv-box__corner--br" />
    </motion.div>
  );
}

export { BOX_STATE };
