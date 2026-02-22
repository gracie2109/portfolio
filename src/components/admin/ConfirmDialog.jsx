/**
 * Confirm-delete dialog using native <dialog>.
 *
 * @param {{ open, itemLabel, onConfirm, onCancel }} props
 */
import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, itemLabel, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="admin-modal admin-confirm" onClick={(e) => e.target === ref.current && onCancel()}>
      <div className="admin-modal-inner">
        <p>Are you sure you want to delete <strong>{itemLabel}</strong>?</p>
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
}
