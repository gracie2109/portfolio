import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import confetti from "canvas-confetti";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import ScratchCard from "../ui/ScratchCard";
import ResumePreviewModal from "../ui/ResumeModal";
import { useLanguage } from "../../i18n/useLanguage";

/* ── helpers ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(missMessages) {
  const winIdx = Math.floor(Math.random() * 4);
  const msgs = shuffle(missMessages).slice(0, 3);
  return Array.from({ length: 4 }, (_, i) => {
    if (i === winIdx) return { type: "resume" };
    return { type: "miss", message: msgs.pop() || missMessages[0] };
  });
}

/* ── card size hook ── */
function useCardSize() {
  const [size, setSize] = useState({ w: 260, h: 340 });
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      if (vw <= 480) setSize({ w: Math.min(vw - 48, vw / 2.5), h: 220 });
      else if (vw <= 768) setSize({ w: 240, h: 320 });
      else setSize({ w: 260, h: 340 });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return size;
}

/* ── confetti burst — same style as Hero "Kết nối ngay" button ── */
function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ["#9382ff", "#ff6b6b", "#4ecdc4", "#ffe66d", "#ff8a5c"];
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ────────────────────── ICONS ────────────────────── */
const QuestionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle
      cx="24"
      cy="24"
      r="22"
      stroke="currentColor"
      strokeWidth="2.5"
      opacity=".35"
    />
    <text
      x="24"
      y="30"
      textAnchor="middle"
      fill="currentColor"
      fontSize="24"
      fontWeight="bold"
      fontFamily="inherit"
    >
      ?
    </text>
  </svg>
);

const StarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#c9a84c" strokeWidth="2.5" />
    <text
      x="24"
      y="31"
      textAnchor="middle"
      fill="#c9a84c"
      fontSize="22"
      fontFamily="inherit"
    >
      ✦
    </text>
  </svg>
);

const SadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle
      cx="24"
      cy="24"
      r="22"
      stroke="#8a879a"
      strokeWidth="2.5"
      opacity=".5"
    />
    <text
      x="24"
      y="31"
      textAnchor="middle"
      fill="#8a879a"
      fontSize="20"
      fontFamily="inherit"
    >
      🌧
    </text>
  </svg>
);

/* ──────────────────── STATES ──────────────────── */
const CARD_STATES = {
  HIDDEN: "hidden",
  FOUND: "found",
  MISS: "miss",
};

/* ──────────────────── COMPONENT ──────────────────── */
export default function Resume() {
  const { t } = useLanguage();
  const cardSize = useCardSize();
  const cardRefs = useRef([]);
  const missMessages = useMemo(
    () =>
      t.resume?.missMessages ?? [
        "Thử lại nhé! 💪",
        "Đừng bỏ cuộc! Hãy tìm tiếp 🔍",
        "Chúc bạn may mắn lần sau! 🍀",
        "Ôi không! Thử card khác nhé 😅",
      ],
    [t],
  );

  // Build card data — initialised eagerly (no useEffect)
  const [gameKey, setGameKey] = useState(0);
  const [cards, setCards] = useState(() => buildCards(missMessages));
  const [states, setStates] = useState([
    CARD_STATES.HIDDEN,
    CARD_STATES.HIDDEN,
    CARD_STATES.HIDDEN,
    CARD_STATES.HIDDEN,
  ]);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [openModal, setOpenModal] = useState(false)
  // Reset game
  const initGame = useCallback(() => {
    setCards(buildCards(missMessages));
    setStates([
      CARD_STATES.HIDDEN,
      CARD_STATES.HIDDEN,
      CARD_STATES.HIDDEN,
      CARD_STATES.HIDDEN,
    ]);
    setFoundIndex(-1);
    setGameKey((k) => k + 1);
  }, [missMessages]);

  // ── reveal handler ──
  const handleReveal = useCallback(
    (idx) => {
      if (states[idx] !== CARD_STATES.HIDDEN) return;

      const card = cards[idx];
      const isWin = card?.type === "resume";

      setStates((prev) => {
        const next = [...prev];
        next[idx] = isWin ? CARD_STATES.FOUND : CARD_STATES.MISS;
        if (isWin) {
          // disable remaining hidden cards
          next.forEach((s, i) => {
            if (i !== idx && s === CARD_STATES.HIDDEN)
              next[i] = CARD_STATES.HIDDEN;
          });
        }
        return next;
      });

      if (isWin) {
        setFoundIndex(idx);
        // continuous confetti burst like Hero button
        setTimeout(() => fireConfetti(), 200);
      }
    },
    [cards, states],
  );

  const gameOver = foundIndex >= 0;

  const renderHeading = () => {
    const heading = t.resume?.heading ?? "Tìm kiếm ứng viên {accent}";
    const accent = t.resume?.headingAccent ?? "bí ẩn";
    const parts = heading.split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{accent}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section id="resume" className="section resume-section">
      <div className="section-inner resume-inner">
        <FadeSection>
          <span className="section-tag">{t.resume?.tag ?? "// RESUME"}</span>
        </FadeSection>
        <RevealText className="section-heading resume-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        <FadeSection delay={0.2}>
          <p className="resume-subtitle">
            {t.resume?.subtitle ??
              "Chỉ có 1 thẻ duy nhất chứa Resume. Hãy dùng cọ để cào và thử vận may!"}
          </p>
        </FadeSection>

        {/* ── Card Grid ── */}
        <div className="resume-grid" key={gameKey}>
          {cards.map((card, idx) => {
            const state = states[idx];
            const isDisabled = gameOver && state === CARD_STATES.HIDDEN;

            return (
              <FadeSection delay={0.15 + idx * 0.08} key={idx}>
                <div
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className={`resume-card resume-card--${state} ${
                    state === CARD_STATES.FOUND ? "resume-card--glow" : ""
                  } ${isDisabled ? "resume-card--disabled" : ""}`}
                >
                  <ScratchCard
                    width={cardSize.w}
                    height={cardSize.h}
                    disabled={isDisabled || state !== CARD_STATES.HIDDEN}
                    onReveal={() => handleReveal(idx)}
                    overlayTheme={{
                      colors: ["#1a1a2e", "#16213e", "#0f3460"],
                      accentColor: "#9382ff",
                      texts: ["?", "✦", "★", "✿", "♦", "◆"],
                      label: t.resume?.scratchLabel ?? "CÀO TẠI ĐÂY",
                    }}
                  >
                    {/* Inner content */}
                    <div className="resume-card__body">
                      {state === CARD_STATES.HIDDEN && (
                        <>
                          <QuestionIcon />
                          <span className="resume-card__label resume-card__label--mystery">
                            {t.resume?.mystery ?? "BÍ ẨN"}
                          </span>
                        </>
                      )}
                      {state === CARD_STATES.FOUND && (
                        <>
                          <StarIcon />
                          <span className="resume-card__label resume-card__label--found">
                            {t.resume?.found}
                          </span>
                          asdas
                          {/* <span className="resume-card__title">
                            {t.resume?.previewLabel ?? "Preview Resume"} 📄
                          </span> */}

                        </>
                      )}
                      {state === CARD_STATES.MISS && (
                        <>
                          <SadIcon />
                          <span className="resume-card__label resume-card__label--miss">
                            {t.resume?.ohNo ?? "ÔI KHÔNG"}
                          </span>
                          <span className="resume-card__message">
                            {card.message}
                          </span>
                        </>
                      )}
                    </div>
                  </ScratchCard>
                </div>
              </FadeSection>
            );
          })}
        </div>

        {/* ── Actions after game ends ── */}
        {gameOver && (
          <FadeSection delay={0.2}>
            <div className="resume-actions">
              <button
                className="resume-btn resume-btn--primary"
                onClick={() => setOpenModal(true)}
              >
                {t.resume?.viewBtn ?? "Xem Resume 📄"}
              </button>
              <button
                className="resume-btn resume-btn--ghost"
                onClick={initGame}
              >
                {t.resume?.replayBtn ?? "Chơi lại 🔄"}
              </button>
            </div>
          </FadeSection>
        )}

        {/* ── Resume Preview Modal ── */}
        <ResumePreviewModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      </div>
    </section>
  );
}
