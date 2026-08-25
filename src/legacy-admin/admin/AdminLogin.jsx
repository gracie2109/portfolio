import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLogin() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → go to admin
  if (!loading && user) return <Navigate to="/admin/skills" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">⚡</div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Enter your credentials to continue</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            autoFocus
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="login-btn"
          disabled={submitting || loading}
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <a href="/" className="login-back">← Back to Portfolio</a>
      </form>
    </div>
  );
}
