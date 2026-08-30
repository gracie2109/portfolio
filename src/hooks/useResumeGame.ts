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
  // True while a pick is mid-flight (OPENING, awaiting its 1s reveal timeout).
  // A plain ref — not state — because it must gate re-entrant clicks
  // synchronously; state updates aren't guaranteed to apply before the
  // next click event is handled.
  const isOpeningRef = useRef(false);

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
      // Only one pick may be in flight at a time — a rapid second click
      // (on this box or another) while the first is still resolving is a no-op.
      if (isOpeningRef.current) return;

      setBoxStates((prev) => {
        if (prev[idx] !== BOX_STATE.SEALED) return prev;
        return prev.map((s, i) => (i === idx ? BOX_STATE.OPENING : s));
      });

      isOpeningRef.current = true;
      setPhase((prev) => (prev === "idle" ? "playing" : prev));
      playSuspenseSfx();

      const card = cardsRef.current[idx];

      setTimeout(() => {
        const isWin = card.type === "resume";

        setBoxStates((prev) =>
          prev.map((s, i) => {
            if (i === idx) return isWin ? BOX_STATE.WIN : BOX_STATE.MISS;
            // On win → disable remaining sealed boxes (merged from useEffect)
            if (isWin && s === BOX_STATE.SEALED) return BOX_STATE.DISABLED;
            return s;
          }),
        );

        if (isWin) {
          playWinSfx();
          setPhase("finished");
          setTimeout(fireConfetti, 200);
          // Stays locked — the game is over until initGame() resets it.
        } else {
          playMissSfx();
          isOpeningRef.current = false;
        }
      }, 1000);
    },
    [], // no deps needed — everything accessed via refs or functional setState
  );

  /* ── Reset game ── */
  const initGame = useCallback(() => {
    cardsRef.current = buildCards(missMessages);
    isOpeningRef.current = false;
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
