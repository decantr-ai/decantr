import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './hooks/useAuth';
import { TopNavFooter } from './shells/TopNavFooter';
import { Centered } from './shells/Centered';
import { CopilotOverlay } from './shells/CopilotOverlay';
import { SidebarMain } from './shells/SidebarMain';
import { HomePage } from './pages/marketing/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { WorkspaceDetailPage } from './pages/workspace/WorkspaceDetailPage';
import { CopilotConfigPage } from './pages/copilot/CopilotConfigPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { CommandPalette } from './components/CommandPalette';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('decantr_authenticated') === 'true';
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('decantr_authenticated') === 'true'
  );
  const [paletteOpen, setPaletteOpen] = useState(false);

  const login = useCallback(() => {
    localStorage.setItem('decantr_authenticated', 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('decantr_authenticated');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <HashRouter>
        <Routes>
          {/* Public zone — top-nav-footer shell */}
          <Route element={<TopNavFooter />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Gateway zone — centered shell */}
          <Route element={<Centered />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* App zone — copilot-overlay shell (primary) */}
          <Route element={<AuthGuard><CopilotOverlay /></AuthGuard>}>
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspace/:id" element={<WorkspaceDetailPage />} />
          </Route>

          {/* App zone — sidebar-main shell (auxiliary) */}
          <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
            <Route path="/copilot/config" element={<CopilotConfigPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </HashRouter>
    </AuthContext.Provider>
  );
}
