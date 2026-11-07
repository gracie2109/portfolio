/**
 * Lets any component (hero CTA, navbar) open the resume preview modal that
 * lives inside the Resume section, without lifting its state up.
 */
export const RESUME_OPEN_EVENT = "resume:open";

export const openResume = () => {
  window.dispatchEvent(new Event(RESUME_OPEN_EVENT));
};
