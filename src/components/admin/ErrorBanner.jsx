/**
 * Inline error banner for admin pages.
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="admin-error">
      <span>⚠️ {message}</span>
      {onDismiss && (
        <button className="admin-error-close" onClick={onDismiss}>✕</button>
      )}
    </div>
  );
}
