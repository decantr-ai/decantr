import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { TopNavFooter } from './shells/TopNavFooter';
import { Centered } from './shells/Centered';
import { SidebarMain } from './shells/SidebarMain';
import { HomePage } from './pages/marketing/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';
import { AgentOverview } from './pages/agents/AgentOverview';
import { AgentDetail } from './pages/agents/AgentDetail';
import { AgentConfig } from './pages/agents/AgentConfig';
import { AgentMarketplace } from './pages/agents/AgentMarketplace';
import { ModelOverview } from './pages/transparency/ModelOverview';
import { InferenceLog } from './pages/transparency/InferenceLog';
import { ConfidenceExplorer } from './pages/transparency/ConfidenceExplorer';
import { CommandPalette } from './components/CommandPalette';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

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
            <Route path="/" element={<HomePage />} />
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

          {/* App zone — sidebar-main shell (primary + auxiliary) */}
          <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
            <Route path="/agents" element={<AgentOverview />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/agents/config" element={<AgentConfig />} />
            <Route path="/marketplace" element={<AgentMarketplace />} />
            <Route path="/transparency" element={<ModelOverview />} />
            <Route path="/transparency/inference" element={<InferenceLog />} />
            <Route path="/transparency/confidence" element={<ConfidenceExplorer />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </HashRouter>
    </AuthContext.Provider>
  );
}
