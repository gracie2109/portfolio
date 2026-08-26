interface ErrorBannerProps {
  message?: string | null;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
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
