import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import FadeSection from "../animation/FadeSection";
import RevealText from "../animation/RevealText";
import MagneticButton from "../ui/MagneticButton";
import { useLanguage } from "../../i18n/useLanguage";
import { usePublicData } from "../../hooks/usePublicData";
import SkillOrb from "../ui/SkillOrb";

/* ── confetti burst on success ── */
function fireSuccessConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#9382ff", "#4ecdc4", "#ffe66d", "#ff8a5c", "#ff6b6b"];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function Contact() {
  const { t, lang } = useLanguage();
  const { data: contactLinks, loading } = usePublicData("contacts");
  const formRef = useRef(null);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const f = t.contact?.form ?? {};

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(false);

    try {
      // Simulate sending (replace with real API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSent(true);
      fireSuccessConfetti();
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setError(false);
  };

  const renderHeading = () => {
    const parts = t.contact.heading.split("{accent}");
    return <>{parts[0]}<span className="accent">{t.contact.headingAccent}</span>{parts[1]}</>;
  };

  const isValid = formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <section id="contact" className="section contact-section">
      <div className="section-inner contact-inner">
        <FadeSection>
          <span className="section-tag">{t.contact.tag}</span>
        </FadeSection>
        <RevealText className="section-heading contact-heading" delay={0.1}>
          {renderHeading()}
        </RevealText>
        <FadeSection delay={0.3}>
          <p className="contact-text">{t.contact.text}</p>
        </FadeSection>

        {/* ── Contact links ── */}
        {loading ? (
          <p className="section-loading">{lang === "vi" ? "Đang tải…" : "Loading…"}</p>
        ) : (
          <FadeSection delay={0.3}>
            <div className="contact-links">
              {contactLinks.map((link, i) => (
                <MagneticButton
                  key={link.id}
                  className="contact-link"
                  href={link.href}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  data_type={link?.data_type}
                >
                  <SkillOrb isPlainIcon skill={link} style={{ fontSize: "1.3rem" }} />
                  <span>{link.label}</span>
                </MagneticButton>
              ))}
            </div>
          </FadeSection>
        )}

        {/* ── Contact form ── */}
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
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <motion.div
                    className="contact-success-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
                  >
                    ✓
                  </motion.div>
                  <h3 className="contact-success-title">{f.successTitle ?? "Sent! 🎉"}</h3>
                  <p className="contact-success-text">{f.successText ?? "Thank you!"}</p>
                  <button className="contact-form-btn contact-form-btn--ghost" onClick={handleReset}>
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
                  <h3 className="contact-form-title">{f.title ?? "Send a message"}</h3>

                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label className="contact-form-label">{f.name ?? "Name"}</label>
                      <input
                        type="text"
                        name="name"
                        className="contact-form-input"
                        placeholder={f.namePlaceholder ?? "Your name"}
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="contact-form-group">
                      <label className="contact-form-label">{f.email ?? "Email"}</label>
                      <input
                        type="email"
                        name="email"
                        className="contact-form-input"
                        placeholder={f.emailPlaceholder ?? "email@example.com"}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label">{f.message ?? "Message"}</label>
                    <textarea
                      name="message"
                      className="contact-form-textarea"
                      placeholder={f.messagePlaceholder ?? "Your message..."}
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && <p className="contact-form-error">{f.errorText ?? "Error. Please try again."}</p>}

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
