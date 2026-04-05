import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { SidebarMain } from './shells/SidebarMain';
import { WorkspaceAside } from './shells/WorkspaceAside';
import { Centered } from './shells/Centered';
import { TopNavMain } from './shells/TopNavMain';
import { useAuth } from './hooks/useAuth';

// Public (marketing)
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Auth
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MfaSetupPage } from './pages/MfaSetupPage';
import { MfaVerifyPage } from './pages/MfaVerifyPage';

// App
import { WorkspaceHomePage } from './pages/WorkspaceHomePage';
import { DocEditorPage } from './pages/DocEditorPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsGeneralPage } from './pages/SettingsGeneralPage';
import { SettingsMembersPage } from './pages/SettingsMembersPage';
import { SettingsPermissionsPage } from './pages/SettingsPermissionsPage';
import { SettingsBillingPage } from './pages/SettingsBillingPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProfileSecurityPage } from './pages/ProfileSecurityPage';
import { ProfilePreferencesPage } from './pages/ProfilePreferencesPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Gateway zone — centered */}
        <Route element={<GuestGuard><Centered /></GuestGuard>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        </Route>

        {/* App primary — sidebar-main (workspace-home) */}
        <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
          <Route path="/home" element={<WorkspaceHomePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsGeneralPage />} />
          <Route path="/settings/members" element={<SettingsMembersPage />} />
          <Route path="/settings/permissions" element={<SettingsPermissionsPage />} />
          <Route path="/settings/billing" element={<SettingsBillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/security" element={<ProfileSecurityPage />} />
          <Route path="/profile/preferences" element={<ProfilePreferencesPage />} />
        </Route>

        {/* App primary — workspace-aside (document-editor) */}
        <Route element={<AuthGuard><WorkspaceAside /></AuthGuard>}>
          <Route path="/doc/:id" element={<DocEditorPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* TopNavMain imported for completeness / zone variant */}
      <TopNavMainMount />
    </HashRouter>
  );
}

// Keep import used to avoid unused warnings while retaining shell for future routes.
function TopNavMainMount() {
  void TopNavMain;
  return null;
}
