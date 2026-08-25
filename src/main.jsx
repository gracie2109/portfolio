import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import "./index.css";
import { createI18nInstance } from "./i18n/i18n";
import LanguageSync from "./i18n/LanguageSync";
import App from "./App.jsx";
import { AuthProvider } from "./hooks/AuthProvider";

/* Admin */
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminExperiences from "./pages/admin/AdminExperiences";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminContactsMe from "./pages/admin/AdminContactWithMe";

import "./styles/admin.css";

const i18nInstance = createI18nInstance();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18nInstance}>
      <LanguageSync />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="skills" replace />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="experiences" element={<AdminExperiences />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="contact-with-me" element={<AdminContactsMe />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  </StrictMode>,
);
