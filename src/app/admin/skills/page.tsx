"use client";

import { AuthProvider } from "@/hooks/AuthProvider";
import { useAuth } from "@/hooks/useAuth";

/**
 * Temporary Phase 1 placeholder — only exists to verify middleware
 * gating + logout. Replaced by the real AdminSkills page in Phase 3.
 */
function SkillsPlaceholder() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ padding: 32 }}>
      <p>Admin skills placeholder — Phase 1 test</p>
      <p>Logged in as: {user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

export default function AdminSkillsPage() {
  return (
    <AuthProvider>
      <SkillsPlaceholder />
    </AuthProvider>
  );
}
