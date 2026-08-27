import { useState, useCallback, useMemo, useRef } from "react";
import { BOX_STATE, type BoxState } from "../components/ui/SecretCVBox";
import { playSuspenseSfx, playWinSfx, playMissSfx } from "../utils/sfx";

interface Card {
  id: number;
  type: "resume" | "miss";
  message?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(missMessages: string[]): Card[] {
  const winIdx = Math.floor(Math.random() * 4);
  const msgs = shuffle(missMessages).slice(0, 3);
  return Array.from({ length: 4 }, (_, i) =>
    i === winIdx
      ? { id: i, type: "resume" }
      : { id: i, type: "miss", message: msgs.pop() || missMessages[0] },
  );
}

/* client-only: requestAnimationFrame; dynamic import keeps canvas-confetti out of the initial bundle */
async function fireConfetti() {
  const { default: confetti } = await import("canvas-confetti");
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

/**
 * "Secret CV box" game state machine: SEALED → OPENING → WIN/MISS → DISABLED.
 * Client-only (setTimeout-driven state + confetti side-effect).
 *
 * @param missMessages — pool of messages shown on a miss, re-shuffled per game
 */
export function useResumeGame(missMessages: string[]) {
  // Use ref for cards so handlePick never needs cards in its dep array
  const cardsRef = useRef<Card[]>(buildCards(missMessages));

  // eslint-disable-next-line react-hooks/refs
  const [boxStates, setBoxStates] = useState<BoxState[]>(() =>
    cardsRef.current.map(() => BOX_STATE.SEALED),
  );
  const [phase, setPhase] = useState<"idle" | "playing" | "finished">("idle");

  const hasWin = useMemo(
    () => boxStates.some((s) => s === BOX_STATE.WIN),
    [boxStates],
  );

  /* ── Handle pick ──
     Uses functional setState → removes boxStates & cards from deps.
     Merges "disable sealed boxes" logic here → removes the useEffect.        */
  const handlePick = useCallback(
    (idx: number) => {
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
      playSuspenseSfx();

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
          playWinSfx();
          setPhase("finished");
          setTimeout(fireConfetti, 200);
        } else {
          playMissSfx();
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

  /* eslint-disable react-hooks/refs -- cards intentionally read via ref to avoid re-render on rebuild */
  return {
    cards: cardsRef.current,
    boxStates,
    phase,
    hasWin,
    handlePick,
    initGame,
  };
  /* eslint-enable react-hooks/refs */
}
