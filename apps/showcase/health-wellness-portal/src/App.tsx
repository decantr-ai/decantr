import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { MinimalHeader } from '@/shells/MinimalHeader';

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
import { VitalsPage } from '@/pages/VitalsPage';
import { MedicationsPage } from '@/pages/MedicationsPage';

import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { BookAppointmentPage } from '@/pages/BookAppointmentPage';
import { AppointmentDetailPage } from '@/pages/AppointmentDetailPage';

import { TelehealthSessionPage } from '@/pages/TelehealthSessionPage';

import { RecordsPage } from '@/pages/RecordsPage';
import { RecordDetailPage } from '@/pages/RecordDetailPage';
import { IntakePage } from '@/pages/IntakePage';

import { SettingsProfilePage } from '@/pages/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/SettingsDangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone — marketing */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway zone — auth */}
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

      {/* Telehealth session — minimal header */}
      <Route element={<MinimalHeader />}>
        <Route path="/telehealth" element={<TelehealthSessionPage />} />
      </Route>

      {/* App zone — sidebar-main */}
      <Route element={<SidebarMain />}>
        {/* patient-dashboard (primary) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vitals" element={<VitalsPage />} />
        <Route path="/medications" element={<MedicationsPage />} />

        {/* appointment-center */}
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/book" element={<BookAppointmentPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailPage />} />

        {/* health-records */}
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="/intake" element={<IntakePage />} />

        {/* settings-full */}
        <Route path="/settings/profile" element={<SettingsProfilePage />} />
        <Route path="/settings/security" element={<SettingsSecurityPage />} />
        <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
        <Route path="/settings/danger" element={<SettingsDangerPage />} />
      </Route>

      {/* Default redirect */}
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
