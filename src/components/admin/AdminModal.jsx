import { useEffect, useRef } from "react";

/**
 * Generic modal dialog for admin forms.
 *
 * @param {{ open, title, onClose, onSubmit, children }} props
 */
export default function AdminModal({ open, title, onClose, onSubmit, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <dialog ref={dialogRef} className="admin-modal" onClick={handleBackdropClick}>
      <form className="admin-modal-inner" onSubmit={handleSubmit}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn-primary">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
