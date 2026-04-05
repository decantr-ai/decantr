import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { SidebarMain } from '@/shells/SidebarMain';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { Centered } from '@/shells/Centered';

import { HomePage } from '@/pages/HomePage';

import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/PhoneVerifyPage';

import { DashboardPage } from '@/pages/DashboardPage';
import { PipelinePage } from '@/pages/PipelinePage';
import { ContactsPage } from '@/pages/ContactsPage';
import { ContactDetailPage } from '@/pages/ContactDetailPage';
import { DealsPage } from '@/pages/DealsPage';
import { DealDetailPage } from '@/pages/DealDetailPage';

import { InboxPage } from '@/pages/InboxPage';
import { ComposePage } from '@/pages/ComposePage';

import { MeetingsPage } from '@/pages/MeetingsPage';
import { MeetingDetailPage } from '@/pages/MeetingDetailPage';

import { InsightsPage } from '@/pages/InsightsPage';

import { SettingsProfilePage } from '@/pages/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/SettingsDangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway — auth */}
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

      {/* App — sidebar-main */}
      <Route element={<SidebarMain />}>
        {/* crm-dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contacts/:id" element={<ContactDetailPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:id" element={<DealDetailPage />} />

        {/* crm-email */}
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/compose" element={<ComposePage />} />

        {/* crm-meetings */}
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/meetings/:id" element={<MeetingDetailPage />} />

        {/* crm-intelligence */}
        <Route path="/insights" element={<InsightsPage />} />

        {/* settings-full */}
        <Route path="/settings/profile" element={<SettingsProfilePage />} />
        <Route path="/settings/security" element={<SettingsSecurityPage />} />
        <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
        <Route path="/settings/danger" element={<SettingsDangerPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
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
