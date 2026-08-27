"use client";

import { useEffect, useState } from "react";

export default function RedoAnimText({ delay, texts }: { delay: number; texts: string[] }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let textIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const TYPE_DURATION_MS = 1000;
    const CHAR_COUNT = 60;
    const CHAR_INTERVAL_MS = TYPE_DURATION_MS / CHAR_COUNT;
    const HOLD_MS = 1000;

    const typeOut = () => {
      const full = texts[textIndex] || "";
      let charIndex = 0;
      intervalId = setInterval(() => {
        charIndex++;
        setDisplayText(full.slice(0, charIndex));
        if (charIndex >= full.length) {
          clearInterval(intervalId);
          timeoutId = setTimeout(eraseOut, HOLD_MS);
        }
      }, CHAR_INTERVAL_MS);
    };

    const eraseOut = () => {
      const full = texts[textIndex] || "";
      let charIndex = full.length;
      intervalId = setInterval(() => {
        charIndex--;
        setDisplayText(full.slice(0, charIndex));
        if (charIndex <= 0) {
          clearInterval(intervalId);
          textIndex = (textIndex + 1) % texts.length;
          timeoutId = setTimeout(typeOut, HOLD_MS);
        }
      }, CHAR_INTERVAL_MS);
    };

    timeoutId = setTimeout(typeOut, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span className="inline">{displayText}</span>;
}
