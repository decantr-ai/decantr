import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';

import { HomePage } from '@/pages/HomePage';
import { MetricsOverviewPage } from '@/pages/MetricsOverviewPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { LogsPage } from '@/pages/LogsPage';
import { LogDetailPage } from '@/pages/LogDetailPage';
import { TracesPage } from '@/pages/TracesPage';
import { TraceDetailPage } from '@/pages/TraceDetailPage';
import { TopologyPage } from '@/pages/TopologyPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { AlertRulesPage } from '@/pages/AlertRulesPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { IncidentDetailPage } from '@/pages/IncidentDetailPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

import { SettingsProfilePage } from '@/pages/settings/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/settings/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/settings/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/settings/SettingsDangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone — top-nav-footer */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway zone — centered */}
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

      {/* App zone — sidebar-main */}
      <Route element={<SidebarMain />}>
        {/* metrics (primary) */}
        <Route path="/metrics" element={<MetricsOverviewPage />} />
        <Route path="/metrics/:service" element={<ServiceDetailPage />} />

        {/* logs */}
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />

        {/* traces */}
        <Route path="/traces" element={<TracesPage />} />
        <Route path="/traces/:id" element={<TraceDetailPage />} />
        <Route path="/traces/topology" element={<TopologyPage />} />

        {/* alerts / incidents */}
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/alerts/rules" element={<AlertRulesPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />

        {/* settings */}
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
