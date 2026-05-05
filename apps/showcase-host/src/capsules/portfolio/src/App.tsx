import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FullBleed } from './shells/FullBleed';
import { TopNavMain } from './shells/TopNavMain';
import { Centered } from './shells/Centered';
import { SidebarMain } from './shells/SidebarMain';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AboutPage } from './pages/AboutPage';
import { SkillsPage } from './pages/SkillsPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Gateway zone — centered shell (auth) */}
        <Route
          element={
            <GuestGuard>
              <Centered />
            </GuestGuard>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* App zone (primary) — full-bleed shell (portfolio-showcase) */}
        <Route
          element={
            <AuthGuard>
              <FullBleed />
            </AuthGuard>
          }
        >
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Route>

        {/* App zone (auxiliary) — top-nav-main shell (portfolio-about, portfolio-blog) */}
        <Route
          element={
            <AuthGuard>
              <TopNavMain />
            </AuthGuard>
          }
        >
          <Route path="/about" element={<AboutPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-main shell (settings) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </HashRouter>
  );
}
