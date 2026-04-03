import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { TopNavMain } from '@/shells/TopNavMain';
import { Centered } from '@/shells/Centered';
import { SidebarMain } from '@/shells/SidebarMain';
import { HomePage } from '@/pages/registry/HomePage';
import { BrowsePage } from '@/pages/registry/BrowsePage';
import { BrowseTypePage } from '@/pages/registry/BrowseTypePage';
import { DetailPage } from '@/pages/registry/DetailPage';
import { ProfilePage } from '@/pages/registry/ProfilePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { ContentPage } from '@/pages/dashboard/ContentPage';
import { ContentNewPage } from '@/pages/dashboard/ContentNewPage';
import { ApiKeysPage } from '@/pages/dashboard/ApiKeysPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';
import { BillingPage } from '@/pages/dashboard/BillingPage';
import { TeamPage } from '@/pages/dashboard/TeamPage';
import { ModerationQueuePage } from '@/pages/admin/ModerationQueuePage';
import { ModerationDetailPage } from '@/pages/admin/ModerationDetailPage';
import { CommandPalette } from '@/components/CommandPalette';

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
          {/* Public zone — TopNavMain shell */}
          <Route element={<TopNavMain />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/browse/:type" element={<BrowseTypePage />} />
            <Route path="/:type/:namespace/:slug" element={<DetailPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
          </Route>

          {/* Gateway zone — Centered shell */}
          <Route element={<Centered />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* App zone — SidebarMain shell (dashboard) */}
          <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
            <Route path="/dashboard" element={<OverviewPage />} />
            <Route path="/dashboard/content" element={<ContentPage />} />
            <Route path="/dashboard/content/new" element={<ContentNewPage />} />
            <Route path="/dashboard/api-keys" element={<ApiKeysPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/billing" element={<BillingPage />} />
            <Route path="/dashboard/team" element={<TeamPage />} />
          </Route>

          {/* App zone — SidebarMain shell (admin) */}
          <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
            <Route path="/admin/moderation" element={<ModerationQueuePage />} />
            <Route path="/admin/moderation/:id" element={<ModerationDetailPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </HashRouter>
    </AuthContext.Provider>
  );
}
