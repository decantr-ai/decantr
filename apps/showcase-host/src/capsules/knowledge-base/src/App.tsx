import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { ThreeColumnBrowser } from './shells/ThreeColumnBrowser';
import { TopNavMain } from './shells/TopNavMain';
import { SidebarMain } from './shells/SidebarMain';
import { Centered } from './shells/Centered';
import { HomePage } from './pages/HomePage';
import { DocsPage } from './pages/DocsPage';
import { DocDetailPage } from './pages/DocDetailPage';
import { SearchPage } from './pages/SearchPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { ChangelogDetailPage } from './pages/ChangelogDetailPage';
import { ApiRefPage } from './pages/ApiRefPage';
import { ApiEndpointPage } from './pages/ApiEndpointPage';
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
    return <Navigate to="/docs" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer shell (marketing) */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

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

        {/* App zone (primary) — three-column-browser shell (doc-browser) */}
        <Route
          element={
            <AuthGuard>
              <ThreeColumnBrowser />
            </AuthGuard>
          }
        >
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/:slug" element={<DocDetailPage />} />
        </Route>

        {/* App zone (auxiliary) — three-column-browser shell (api-reference) */}
        <Route
          element={
            <AuthGuard>
              <ThreeColumnBrowser />
            </AuthGuard>
          }
        >
          <Route path="/api" element={<ApiRefPage />} />
          <Route path="/api/:endpoint" element={<ApiEndpointPage />} />
        </Route>

        {/* App zone (auxiliary) — top-nav-main shell (changelog-center) */}
        <Route
          element={
            <AuthGuard>
              <TopNavMain />
            </AuthGuard>
          }
        >
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/changelog/:id" element={<ChangelogDetailPage />} />
        </Route>

        {/* App zone (auxiliary) — sidebar-main shell (search-hub, settings) */}
        <Route
          element={
            <AuthGuard>
              <SidebarMain />
            </AuthGuard>
          }
        >
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
