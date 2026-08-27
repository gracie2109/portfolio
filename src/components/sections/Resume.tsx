"use client";

import { useMemo, useState, useCallback } from "react";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import SecretCVBox from "../ui/SecretCVBox";
import ResumePreviewModal from "../ui/ResumeModal";
import { useTranslation } from "react-i18next";
import { useResumeData } from "../../hooks/useResumeData";
import { useResumeGame } from "../../hooks/useResumeGame";
import { playClickSfx } from "../../utils/sfx";

/* ── COMPONENT ── */
export default function Resume() {
  const { t } = useTranslation();

  const { resumes, loading: resumeLoading, error: resumeError, retry: fetchResumes } = useResumeData();
  const [resumesRequested, setResumesRequested] = useState(false);

  // Stable miss messages — only recompute when translation changes
  const missMessages = useMemo(
    () => t("resume.missMessages", { returnObjects: true }) as unknown as string[],
    [t],
  );

  const { cards, boxStates, phase, hasWin, handlePick, initGame } = useResumeGame(missMessages);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = useCallback(() => {
    if (!resumesRequested) {
      setResumesRequested(true);
      fetchResumes();
    }
    setOpenModal(true);
  }, [resumesRequested, fetchResumes]);

  /* ── Heading — memoized to avoid splitting string on every render ── */
  const heading = useMemo(() => {
    const raw = t("resume.heading");
    const accent = t("resume.headingAccent");
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
          <span className="section-tag">{t("resume.tag")}</span>
        </FadeSection>

        <RevealText className="section-heading resume-heading" delay={0.1}>
          {heading}
        </RevealText>

        <FadeSection delay={0.2}>
          <p className="resume-subtitle">
            {t("resume.subtitle")}
          </p>
        </FadeSection>

        <div className="resume-grid">
          {cards.map((card, idx) => (
            <SecretCVBox
              key={card.id}
              index={idx}
              state={boxStates[idx]}
              missMessage={card.message ?? ""}
              labels={{
                secret: t("resume.mystery"),
                open: t("resume.openHint"),
                found: t("resume.found"),
                ohNo: t("resume.ohNo"),
                locked: t("resume.locked"),
              }}
              onClick={() => {
                playClickSfx();
                handlePick(idx);
              }}
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
                  onClick={handleOpenModal}
                >
                  {t("resume.viewBtn")}
                </button>
              )}
              <button
                className="resume-btn resume-btn--ghost"
                onClick={initGame}
              >
                {t("resume.replayBtn")}
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
