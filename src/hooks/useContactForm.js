import { useState } from "react";
import confetti from "canvas-confetti";
import { contactService } from "../services/contactService";

/* client-only: requestAnimationFrame */
function fireSuccessConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#9382ff", "#4ecdc4", "#ffe66d", "#ff8a5c", "#ff6b6b"];

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
 * Encapsulates the contact form's state, validation, and submit logic.
 * Client-only (browser form state + confetti side-effect).
 */
export function useContactForm(t) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const validateField = (name, value) => {
    let errorMsg = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const trimmed = value.trim();
    const v = t("contact.form.validation", { returnObjects: true }) ?? {};

    if (name === "name") {
      if (!trimmed) errorMsg = v.nameRequired ?? "Name is required";
      else if (trimmed.length < 3) errorMsg = v.nameMin ?? "Name must be at least 3 characters";
    }

    if (name === "email") {
      if (!trimmed) errorMsg = v.emailRequired ?? "Email is required";
      else if (!emailRegex.test(trimmed)) errorMsg = v.emailInvalid ?? "Invalid email format";
    }

    if (name === "message") {
      if (!trimmed) errorMsg = v.messageRequired ?? "Message is required";
      else if (trimmed.length < 3) errorMsg = v.messageMin ?? "Message must be at least 3 characters";
    }

    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "email") {
      processedValue = value.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, processedValue),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      message: formData.message.trim(),
    };

    const errors = {
      name: validateField("name", trimmedData.name),
      email: validateField("email", trimmedData.email),
      message: validateField("message", trimmedData.message),
    };

    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    setSending(true);
    setError(false);

    try {
      await contactService.sendContact(trimmedData);

      setSent(true);
      fireSuccessConfetti();
      setFormData({ name: "", email: "", message: "" });
      setFieldErrors({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setError(false);
  };

  const isValid =
    !fieldErrors.name &&
    !fieldErrors.email &&
    !fieldErrors.message &&
    formData.name.trim() &&
    formData.email.trim() &&
    formData.message.trim();

  return {
    formData,
    fieldErrors,
    sending,
    sent,
    error,
    isValid,
    handleChange,
    handleSubmit,
    handleReset,
  };
}
