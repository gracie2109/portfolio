import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Wraps admin routes — redirects to /admin/login if not authenticated.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="admin-spinner" />
        <span>Checking auth…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return children;
}
