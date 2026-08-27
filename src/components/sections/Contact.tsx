"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import MagneticButton from "../ui/MagneticButton";
import { useTranslation } from "react-i18next";
import SkillOrb from "../ui/SkillOrb";
import { useContactForm } from "../../hooks/useContactForm";

interface ContactFormLabels {
  title?: string;
  name?: string;
  namePlaceholder?: string;
  email?: string;
  emailPlaceholder?: string;
  message?: string;
  messagePlaceholder?: string;
  submit?: string;
  sending?: string;
  successTitle?: string;
  successText?: string;
  sendAnother?: string;
  errorText?: string;
}

interface ContactLink {
  id: string;
  href: string;
  label: string;
  data_type?: string;
  icon?: string;
  name?: string;
}

export default function Contact({ contactLinks }: { contactLinks: ContactLink[] }) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    formData,
    fieldErrors,
    sending,
    sent,
    error,
    isValid,
    handleChange,
    handleSubmit,
    handleReset,
  } = useContactForm(t);

  const f = (t("contact.form", { returnObjects: true }) ?? {}) as ContactFormLabels;

  const renderHeading = () => {
    const parts = t("contact.heading").split("{accent}");
    return (
      <>
        {parts[0]}
        <span className="accent">{t("contact.headingAccent")}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="section-inner contact-inner">
        <FadeSection>
          <span className="section-tag">{t("contact.tag")}</span>
        </FadeSection>

        <RevealText className="section-heading contact-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>

        <FadeSection delay={0.3}>
          <p className="contact-text">{t("contact.text")}</p>
        </FadeSection>

        {/* Contact Links */}
        <FadeSection delay={0.3}>
          <div className="contact-links">
            {contactLinks.map((link) => (
              <MagneticButton
                key={link.id}
                className="contact-link"
                href={link.href}
                data_type={link?.data_type}
              >
                <SkillOrb
                  isPlainIcon
                  skill={link}
                  style={{ fontSize: "1.3rem" }}
                />
                <span>{link.label}</span>
              </MagneticButton>
            ))}
          </div>
        </FadeSection>

        {/* Contact Form */}
        <FadeSection delay={0.45}>
          <div className="contact-form-card">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  className="contact-form-success"
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="contact-success-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                    }}
                  >
                    ✓
                  </motion.div>

                  <h3 className="contact-success-title">
                    {f.successTitle ?? "Sent! 🎉"}
                  </h3>

                  <p className="contact-success-text">
                    {f.successText ?? "Thank you!"}
                  </p>

                  <button
                    className="contact-form-btn contact-form-btn--ghost"
                    onClick={handleReset}
                  >
                    {f.sendAnother ?? "Send Another"}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  className="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="contact-form-title">
                    {f.title ?? "Send a message"}
                  </h3>

                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label className="contact-form-label">
                        {f.name ?? "Name"}
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="contact-form-input"
                        placeholder={f.namePlaceholder ?? "John Doe"}
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      {fieldErrors.name && (
                        <p className="contact-form-error">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="contact-form-group">
                      <label className="contact-form-label">
                        {f.email ?? "Email"}
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="contact-form-input"
                        placeholder={f.emailPlaceholder ?? "example@gmail.com"}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {fieldErrors.email && (
                        <p className="contact-form-error">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label">
                      {f.message ?? "Message"}
                    </label>
                    <textarea
                      name="message"
                      className="contact-form-textarea"
                      rows={5}
                      placeholder={f.messagePlaceholder ?? "What would you like to discuss?"}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.message && (
                      <p className="contact-form-error">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p className="contact-form-error">
                      {f.errorText ?? "Error. Please try again."}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    className="contact-form-btn"
                    disabled={sending || !isValid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {sending ? (
                      <span className="contact-form-btn__sending">
                        <span className="contact-spinner" />
                        {f.sending ?? "Sending..."}
                      </span>
                    ) : (
                      f.submit ?? "Send"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </FadeSection>
      </div>
    </section>
  );
}
