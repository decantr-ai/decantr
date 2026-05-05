import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CommandPalette } from './components/CommandPalette';
import { appCommands } from './data/mock';
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
import { TopNavFooter } from './shells/TopNavFooter';
import { Centered } from './shells/Centered';
import { SidebarMain } from './shells/SidebarMain';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

interface UiContextType {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const UiContext = createContext<UiContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within App');
  }
  return context;
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within App');
  }
  return context;
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('decantr_authenticated') === 'true');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('decantr_theme_mode');
    return saved === 'light' ? 'light' : 'dark';
  });

  const login = useCallback(() => {
    localStorage.setItem('decantr_authenticated', 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('decantr_authenticated');
    setIsAuthenticated(false);
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const togglePalette = useCallback(() => setPaletteOpen((current) => !current), []);
  const toggleTheme = useCallback(() => {
    setThemeMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('decantr_theme_mode', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', themeMode === 'light');
    root.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        togglePalette();
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePalette]);

  const visibleCommands = useMemo(
    () => appCommands.filter((command) => !command.requiresAuth || isAuthenticated),
    [isAuthenticated],
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <UiContext.Provider
        value={{
          paletteOpen,
          openPalette,
          closePalette,
          togglePalette,
          themeMode,
          toggleTheme,
        }}
      >
        <div className="showcase-app" data-theme="carbon-neon">
          <HashRouter>
            <Routes>
              <Route element={<TopNavFooter />}>
                <Route path="/" element={<HomePage />} />
              </Route>

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

              <Route
                element={(
                  <AuthGuard>
                    <SidebarMain />
                  </AuthGuard>
                )}
              >
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
            {paletteOpen ? (
              <CommandPalette commands={visibleCommands} onClose={closePalette} />
            ) : null}
          </HashRouter>
        </div>
      </UiContext.Provider>
    </AuthContext.Provider>
  );
}
