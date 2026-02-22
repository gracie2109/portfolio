import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './hooks/AuthProvider'

/* Admin */
import AdminLogin from './pages/admin/AdminLogin'
import ProtectedRoute from './pages/admin/ProtectedRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminSkills from './pages/admin/AdminSkills'
import AdminProjects from './pages/admin/AdminProjects'
import AdminExperiences from './pages/admin/AdminExperiences'
import AdminContacts from './pages/admin/AdminContacts'
import './styles/admin.css'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <LanguageProvider>
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
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  // </StrictMode>,
)
