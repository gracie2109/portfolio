"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/hooks/AuthProvider";
import { useAuth } from "@/hooks/useAuth";

/**
 * Temporary Phase 1 login form — verifies the auth cookie/middleware
 * flow end to end. Replaced by the real AdminLogin UI in Phase 2/3
 * once react-router-dom usages are converted to next/navigation.
 */
function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signIn(email, password);
      router.push("/admin/skills");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 32, maxWidth: 320 }}>
      <h1>Admin Login (Phase 1 test)</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        type="email"
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
