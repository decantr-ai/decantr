import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { FullBleed } from '@/shells/FullBleed';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { HomePage } from '@/pages/HomePage';
import { AppsPage } from '@/pages/AppsPage';
import { AppDetailPage } from '@/pages/AppDetailPage';
import { TeamPage } from '@/pages/TeamPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { TokensPage } from '@/pages/TokensPage';
import { UsagePage } from '@/pages/UsagePage';
import { StatusPage } from '@/pages/StatusPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { BillingPage } from '@/pages/BillingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone — full-bleed shell */}
      <Route element={<FullBleed />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway zone — centered shell */}
      <Route element={<Centered />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* App zone — sidebar-main shell */}
      <Route element={<SidebarMain />}>
        {/* cloud-infrastructure (primary) */}
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/:id" element={<AppDetailPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/compliance" element={<CompliancePage />} />

        {/* billing (auxiliary) */}
        <Route path="/billing" element={<BillingPage />} />

        {/* settings (auxiliary) */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default redirect — authenticated users go to apps, otherwise home */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function DefaultRedirect() {
  const auth = useAuthProvider();
  return <Navigate to={auth.isAuthenticated ? '/apps' : '/'} replace />;
}

export function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthContext.Provider>
  );
}
