import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { HomePage } from '@/pages/HomePage';
import { DocsPage } from '@/pages/DocsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SsoPage } from '@/pages/SsoPage';
import { InvitePage } from '@/pages/InvitePage';
import { OverviewPage } from '@/pages/OverviewPage';
import { MembersPage } from '@/pages/MembersPage';
import { OrgSettingsPage } from '@/pages/OrgSettingsPage';
import { ApiDocsPage } from '@/pages/ApiDocsPage';
import { ApiKeysPage } from '@/pages/ApiKeysPage';
import { ApiWebhooksPage } from '@/pages/ApiWebhooksPage';
import { WebhookEndpointsPage } from '@/pages/WebhookEndpointsPage';
import { WebhookDetailPage } from '@/pages/WebhookDetailPage';
import { UsagePage } from '@/pages/UsagePage';
import { BillingPage } from '@/pages/BillingPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { AuditLogPage } from '@/pages/AuditLogPage';
import { AuditSettingsPage } from '@/pages/AuditSettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SecurityPage } from '@/pages/SecurityPage';
import { PreferencesPage } from '@/pages/PreferencesPage';
import { DangerPage } from '@/pages/DangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<DocsPage />} />
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
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/org-settings" element={<OrgSettingsPage />} />
        <Route path="/api/docs" element={<ApiDocsPage />} />
        <Route path="/api/keys" element={<ApiKeysPage />} />
        <Route path="/api/webhooks" element={<ApiWebhooksPage />} />
        <Route path="/webhooks" element={<WebhookEndpointsPage />} />
        <Route path="/webhooks/:id" element={<WebhookDetailPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/audit" element={<AuditLogPage />} />
        <Route path="/audit/settings" element={<AuditSettingsPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/security" element={<SecurityPage />} />
        <Route path="/settings/preferences" element={<PreferencesPage />} />
        <Route path="/settings/danger" element={<DangerPage />} />
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function DefaultRedirect() {
  const auth = useAuthProvider();
  return <Navigate to={auth.isAuthenticated ? '/overview' : '/'} replace />;
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
