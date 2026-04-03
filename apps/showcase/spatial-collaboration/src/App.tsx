import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './hooks/useAuth';
import { CanvasOverlay } from './shells/CanvasOverlay';
import { Centered } from './shells/Centered';
import { TopNavFooter } from './shells/TopNavFooter';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { WorkspaceSettingsPage } from './pages/workspace/WorkspaceSettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';
import { AboutPage } from './pages/about/AboutPage';
import { CommandPalette } from './components/CommandPalette';
import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Gateway zone — centered shell */}
          <Route element={<Centered />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/mfa-setup" element={<MfaSetupPage />} />
            <Route path="/mfa-verify" element={<MfaVerifyPage />} />
            <Route path="/phone-verify" element={<PhoneVerifyPage />} />
          </Route>

          {/* App zone — canvas-overlay shell (primary) */}
          <Route element={<AuthGuard><CanvasOverlay /></AuthGuard>}>
            <Route path="/" element={<WorkspacePage />} />
          </Route>

          {/* Settings uses its own layout within the auth guard */}
          <Route
            path="/settings"
            element={<AuthGuard><WorkspaceSettingsPage /></AuthGuard>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </HashRouter>
    </AuthContext.Provider>
  );
}
