import React, { useState, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import SecretCVBox, { BOX_STATE } from "../ui/SecretCVBox";
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

/* ── confetti burst ── */
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

/* ── Game phases ── */
const PHASE = {
  CHOOSING: "choosing",   // user hasn't picked yet
  OPENING: "opening",     // suspense animation
  REVEALED: "revealed",   // result shown
};

/* ──────────────────── COMPONENT ──────────────────── */
export default function Resume() {
  const { t } = useLanguage();
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

  const [gameKey, setGameKey] = useState(0);
  const [cards, setCards] = useState(() => buildCards(missMessages));
  const [phase, setPhase] = useState(PHASE.CHOOSING);
  const [chosenIdx, setChosenIdx] = useState(-1);
  const [openModal, setOpenModal] = useState(false);

  // Determine box states from game phase
  const boxStates = useMemo(() => {
    if (phase === PHASE.CHOOSING) {
      return cards.map(() => BOX_STATE.SEALED);
    }
    if (phase === PHASE.OPENING) {
      return cards.map((_, i) =>
        i === chosenIdx ? BOX_STATE.OPENING : BOX_STATE.DISABLED
      );
    }
    // REVEALED
    return cards.map((card, i) => {
      if (i === chosenIdx) {
        return card.type === "resume" ? BOX_STATE.WIN : BOX_STATE.MISS;
      }
      return BOX_STATE.DISABLED;
    });
  }, [phase, chosenIdx, cards]);

  const isWin = phase === PHASE.REVEALED && cards[chosenIdx]?.type === "resume";

  // ── Pick a box ──
  const handlePick = useCallback(
    (idx) => {
      if (phase !== PHASE.CHOOSING) return;

      setChosenIdx(idx);
      setPhase(PHASE.OPENING);

      // After suspense delay, reveal the result
      const card = cards[idx];
      const revealDelay = 1200; // ms of suspense

      setTimeout(() => {
        setPhase(PHASE.REVEALED);
        if (card.type === "resume") {
          setTimeout(() => fireConfetti(), 200);
        }
      }, revealDelay);
    },
    [phase, cards],
  );

  // ── Replay ──
  const initGame = useCallback(() => {
    setCards(buildCards(missMessages));
    setPhase(PHASE.CHOOSING);
    setChosenIdx(-1);
    setGameKey((k) => k + 1);
  }, [missMessages]);

  // ── Heading renderer ──
  const renderHeading = () => {
    const heading = t.resume?.heading ?? "Chọn Secret CV {accent}";
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

  const labels = {
    secret: t.resume?.mystery ?? "SECRET CV",
    open: t.resume?.openHint ?? "Chọn để mở",
    found: t.resume?.found ?? "ĐÃ TÌM THẤY!",
    ohNo: t.resume?.ohNo ?? "ÔI KHÔNG",
    locked: t.resume?.locked ?? "ĐÃ KHÓA",
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
              "Có 4 Secret CV bí ẩn — chỉ 1 trong số đó chứa Resume thật. Hãy chọn và thử vận may!"}
          </p>
        </FadeSection>

        {/* ── Secret CV Grid ── */}
        <div className="resume-grid" key={gameKey}>
          {cards.map((card, idx) => (
            <SecretCVBox
              key={`cv-${gameKey}-${idx}`}
              index={idx}
              state={boxStates[idx]}
              missMessage={card.message || ""}
              labels={labels}
              onClick={() => handlePick(idx)}
              delay={0.15 + idx * 0.1}
            />
          ))}
        </div>

        {/* ── Actions after reveal ── */}
        {phase === PHASE.REVEALED && (
          <FadeSection delay={0.2}>
            <div className="resume-actions">
              {isWin && (
                <button
                  className="resume-btn resume-btn--primary"
                  onClick={() => setOpenModal(true)}
                >
                  {t.resume?.viewBtn ?? "Xem Resume 📄"}
                </button>
              )}
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
