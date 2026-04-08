import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';

// Shells
import TopNavMain from './shells/TopNavMain';
import SidebarMain from './shells/SidebarMain';
import Centered from './shells/Centered';

// Registry pages
import HomePage from './pages/registry/HomePage';
import BrowsePage from './pages/registry/BrowsePage';
import BrowseTypePage from './pages/registry/BrowseTypePage';
import DetailPage from './pages/registry/DetailPage';
import ProfilePage from './pages/registry/ProfilePage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard pages
import OverviewPage from './pages/dashboard/OverviewPage';
import ContentPage from './pages/dashboard/ContentPage';
import ContentNewPage from './pages/dashboard/ContentNewPage';
import ApiKeysPage from './pages/dashboard/ApiKeysPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import BillingPage from './pages/dashboard/BillingPage';
import TeamPage from './pages/dashboard/TeamPage';

// Admin pages
import ModerationQueuePage from './pages/admin/ModerationQueuePage';
import ModerationDetailPage from './pages/admin/ModerationDetailPage';

// Command Palette
import CommandPalette from './components/CommandPalette';

const dashboardNav = [
  { label: 'Overview', to: '/dashboard', icon: '◉' },
  { label: 'My Content', to: '/dashboard/content', icon: '▦' },
  { label: 'API Keys', to: '/dashboard/api-keys', icon: '⚿' },
  { label: 'Billing', to: '/dashboard/billing', icon: '◈' },
  { label: 'Team', to: '/dashboard/team', icon: '◎' },
  { label: 'Settings', to: '/dashboard/settings', icon: '⚙' },
];

const adminNav = [
  { label: 'Moderation Queue', to: '/admin/moderation', icon: '⚑' },
  { label: 'Back to Dashboard', to: '/dashboard', icon: '←' },
];

function AppRoutes() {
  const { mode, toggle } = useTheme();
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Hotkey listener: g+b, g+d, g+s sequences and Cmd+K
  useEffect(() => {
    let pendingG = false;
    let timer: ReturnType<typeof setTimeout>;

    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl+K: command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
        return;
      }

      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'g') {
        pendingG = true;
        timer = setTimeout(() => { pendingG = false; }, 800);
        return;
      }

      if (pendingG) {
        pendingG = false;
        clearTimeout(timer);
        if (e.key === 'b') navigate('/browse');
        else if (e.key === 'd') navigate('/dashboard');
        else if (e.key === 's') navigate('/dashboard/settings');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(path) => { navigate(path); setPaletteOpen(false); }}
        onThemeToggle={() => { toggle(); setPaletteOpen(false); }}
      />

      <Routes>
        {/* Public registry — top-nav-main shell */}
        <Route element={<TopNavMain onThemeToggle={toggle} themeMode={mode} isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/:type" element={<BrowseTypePage />} />
          <Route path="/:type/:namespace/:slug" element={<DetailPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Route>

        {/* Auth flow — centered shell */}
        <Route element={<Centered />}>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage onLogin={login} />
          } />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Dashboard — sidebar-main shell */}
        <Route element={
          isAuthenticated
            ? <SidebarMain onThemeToggle={toggle} themeMode={mode} onLogout={handleLogout} navItems={dashboardNav} sectionLabel="Dashboard" />
            : <Navigate to="/login" replace />
        }>
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/content" element={<ContentPage />} />
          <Route path="/dashboard/content/new" element={<ContentNewPage />} />
          <Route path="/dashboard/api-keys" element={<ApiKeysPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/billing" element={<BillingPage />} />
          <Route path="/dashboard/team" element={<TeamPage />} />
        </Route>

        {/* Admin — sidebar-main shell */}
        <Route element={
          isAuthenticated
            ? <SidebarMain onThemeToggle={toggle} themeMode={mode} onLogout={handleLogout} navItems={adminNav} sectionLabel="Admin" brandText="admin" />
            : <Navigate to="/login" replace />
        }>
          <Route path="/admin/moderation" element={<ModerationQueuePage />} />
          <Route path="/admin/moderation/:id" element={<ModerationDetailPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
