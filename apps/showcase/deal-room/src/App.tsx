import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SsoPage } from '@/pages/SsoPage';
import { InvitePage } from '@/pages/InvitePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PipelinePage } from '@/pages/PipelinePage';
import { DealsPage } from '@/pages/DealsPage';
import { DealDetailPage } from '@/pages/DealDetailPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { DocumentDetailPage } from '@/pages/DocumentDetailPage';
import { StageGatesPage } from '@/pages/StageGatesPage';
import { QaPage } from '@/pages/QaPage';
import { QaDetailPage } from '@/pages/QaDetailPage';
import { InvestorsPage } from '@/pages/InvestorsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AuditPage } from '@/pages/AuditPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SecurityPage } from '@/pages/SecurityPage';
import { PreferencesPage } from '@/pages/PreferencesPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Gateway zone */}
      <Route element={<Centered />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sso" element={<SsoPage />} />
        <Route path="/invite" element={<InvitePage />} />
      </Route>

      {/* App zone */}
      <Route element={<SidebarMain />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:id" element={<DealDetailPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />
        <Route path="/stage-gates" element={<StageGatesPage />} />
        <Route path="/qa" element={<QaPage />} />
        <Route path="/qa/:id" element={<QaDetailPage />} />
        <Route path="/investors" element={<InvestorsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/security" element={<SecurityPage />} />
        <Route path="/settings/preferences" element={<PreferencesPage />} />
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function DefaultRedirect() {
  const auth = useAuthProvider();
  return <Navigate to={auth.isAuthenticated ? '/dashboard' : '/'} replace />;
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
