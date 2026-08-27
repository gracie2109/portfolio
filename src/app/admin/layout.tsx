"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { type ReactNode } from "react";
import { AuthProvider } from "@/hooks/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/admin.css";

const NAV_ITEMS = [
  { to: "/admin/skills", label: "🎯 Skills" },
  { to: "/admin/projects", label: "📂 Projects" },
  { to: "/admin/experiences", label: "💼 Experiences" },
  { to: "/admin/contacts", label: "📧 Contacts" },
  { to: "/admin/contact-with-me", label: "📧 Contacts Me" },
];

function AdminChrome({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  // Login page renders its own standalone layout — no sidebar/gating.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        className="admin-loading"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="admin-spinner" />
        <span>Checking auth…</span>
      </div>
    );
  }

  if (!user) {
    router.replace("/admin/login");
    return null;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">⚡ Admin</div>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`admin-nav-link ${pathname === item.to ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-user-email">{user.email}</span>
            <button className="admin-btn admin-btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <Link href="/" className="admin-nav-link">← Back to Portfolio</Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminChrome>{children}</AdminChrome>
    </AuthProvider>
  );
}
