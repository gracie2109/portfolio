/* eslint-disable react-hooks/refs */
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import SecretCVBox, { BOX_STATE } from "../ui/SecretCVBox";
import ResumePreviewModal from "../ui/ResumeModal";
import { useLanguage } from "../../i18n/useLanguage";
import { supabase } from "../../lib/supabaseClient";

/* ── helpers (outside component — stable references) ── */
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
  return Array.from({ length: 4 }, (_, i) =>
    i === winIdx
      ? { id: i, type: "resume" }
      : { id: i, type: "miss", message: msgs.pop() || missMessages[0] },
  );
}

function fireConfetti() {
  const duration = 2500;
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

/* ── COMPONENT ── */
export default function Resume() {
  const { t } = useLanguage();

  /* ── Resume data — fetch once on mount ── */
  const [resumes, setResumes] = useState({ en: null, vi: null });
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  const fetchResumes = useCallback(async () => {
    if (!supabase) {
      setResumeError("Supabase not configured");
      return;
    }
    setResumeLoading(true);
    setResumeError(null);
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
      setResumeError(err.message || "Failed to load resumes");
    } finally {
      setResumeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Stable miss messages — only recompute when translation changes
  const missMessages = useMemo(
    () =>
      t.resume?.missMessages ?? [
        "Thử lại nhé! 💪",
        "Đừng bỏ cuộc! 🔍",
        "Chúc may mắn lần sau! 🍀",
        "Ôi không! 😅",
      ],
    [t],
  );

  // Use ref for cards so handlePick never needs cards in its dep array
  const cardsRef = useRef(buildCards(missMessages));

  // eslint-disable-next-line react-hooks/refs
  const [boxStates, setBoxStates] = useState(() =>
    cardsRef.current.map(() => BOX_STATE.SEALED),
  );
  const [phase, setPhase] = useState("idle"); // idle | playing | finished
  const [openModal, setOpenModal] = useState(false);

  const hasWin = useMemo(
    () => boxStates.some((s) => s === BOX_STATE.WIN),
    [boxStates],
  );

  /* ── Handle pick ──
     Uses functional setState → removes boxStates & cards from deps.
     Merges "disable sealed boxes" logic here → removes the useEffect.        */
  const handlePick = useCallback(
    (idx) => {
      setBoxStates((prev) => {
        // Guard: only act on SEALED boxes; block if already finished
        if (prev[idx] !== BOX_STATE.SEALED) return prev;
        // Check phase via prev array (any WIN means we're finished)
        const isFinished = prev.some((s) => s === BOX_STATE.WIN);
        if (isFinished) return prev;

        // Start OPENING animation
        return prev.map((s, i) => (i === idx ? BOX_STATE.OPENING : s));
      });

      setPhase((prev) => (prev === "idle" ? "playing" : prev));

      const card = cardsRef.current[idx];

      setTimeout(() => {
        const isWin = card.type === "resume";

        setBoxStates((prev) => {
          // Guard: if already won from another path, bail
          if (prev.some((s) => s === BOX_STATE.WIN) && !isWin) return prev;

          return prev.map((s, i) => {
            if (i === idx) return isWin ? BOX_STATE.WIN : BOX_STATE.MISS;
            // On win → disable remaining sealed boxes (merged from useEffect)
            if (isWin && s === BOX_STATE.SEALED) return BOX_STATE.DISABLED;
            return s;
          });
        });

        if (isWin) {
          setPhase("finished");
          setTimeout(fireConfetti, 200);
        }
      }, 1000);
    },
    [], // no deps needed — everything accessed via refs or functional setState
  );

  /* ── Reset game ── */
  const initGame = useCallback(() => {
    cardsRef.current = buildCards(missMessages);
    setBoxStates(cardsRef.current.map(() => BOX_STATE.SEALED));
    setPhase("idle");
  }, [missMessages]);

  /* ── Heading — memoized to avoid splitting string on every render ── */
  const heading = useMemo(() => {
    const raw = t.resume?.heading;
    const accent = t.resume?.headingAccent;
    const [before, after] = raw.split("{accent}");
    return (
      <>
        {before}
        <span className="accent">{accent}</span>
        {after}
      </>
    );
  }, [t]);

  return (
    <section id="resume" className="section resume-section">
      <div className="section-inner resume-inner">
        <FadeSection>
          <span className="section-tag">{t.resume?.tag ?? "// RESUME"}</span>
        </FadeSection>

        <RevealText className="section-heading resume-heading" delay={0.1}>
          {heading}
        </RevealText>

        <FadeSection delay={0.2}>
          <p className="resume-subtitle">
            {t.resume?.subtitle}
          </p>
        </FadeSection>

        <div className="resume-grid">
          {cardsRef.current.map((card, idx) => (
            <SecretCVBox
              key={card.id}
              index={idx}
              state={boxStates[idx]}
              missMessage={card.message ?? ""}
              onClick={() => handlePick(idx)}
              delay={0.15 + idx * 0.1}
            />
          ))}
        </div>

        {/* Actions */}
        {phase !== "idle" && (
          <FadeSection delay={0.2}>
            <div className="resume-actions">
              {hasWin && (
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

        <ResumePreviewModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          resumes={resumes}
          loading={resumeLoading}
          error={resumeError}
          onRetry={fetchResumes}
        />
      </div>
    </section>
  );
}
