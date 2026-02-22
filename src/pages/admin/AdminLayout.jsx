import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/skills", label: "🎯 Skills" },
  { to: "/admin/projects", label: "📂 Projects" },
  { to: "/admin/experiences", label: "💼 Experiences" },
  { to: "/admin/contacts", label: "📧 Contacts" },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">⚡ Admin</div>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          {user && (
            <div className="admin-user-info">
              <span className="admin-user-email">{user.email}</span>
              <button className="admin-btn admin-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
          <a href="/" className="admin-nav-link">← Back to Portfolio</a>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
