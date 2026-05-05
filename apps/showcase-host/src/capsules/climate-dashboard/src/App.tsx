import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';

import { MarketingHomePage } from '@/pages/MarketingHomePage';

import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/PhoneVerifyPage';

import { EmissionsOverviewPage } from '@/pages/EmissionsOverviewPage';
import { ScopeDetailPage } from '@/pages/ScopeDetailPage';
import { TargetsPage } from '@/pages/TargetsPage';

import { SuppliersPage } from '@/pages/SuppliersPage';
import { SupplierDetailPage } from '@/pages/SupplierDetailPage';

import { MarketplacePage } from '@/pages/MarketplacePage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';

import { ReportsPage } from '@/pages/ReportsPage';
import { ReportBuilderPage } from '@/pages/ReportBuilderPage';

import { SettingsProfilePage } from '@/pages/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/SettingsDangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone — marketing (top-nav-footer) */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<MarketingHomePage />} />
      </Route>

      {/* Gateway zone — auth (centered) */}
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

      {/* App zone — emissions-dashboard, supply-chain, offset-marketplace, reporting-center, settings-full (sidebar-main) */}
      <Route element={<SidebarMain />}>
        <Route path="/emissions" element={<EmissionsOverviewPage />} />
        <Route path="/emissions/scope/:id" element={<ScopeDetailPage />} />
        <Route path="/emissions/targets" element={<TargetsPage />} />

        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/suppliers/:id" element={<SupplierDetailPage />} />

        <Route path="/offsets" element={<MarketplacePage />} />
        <Route path="/offsets/:id" element={<ProjectDetailPage />} />
        <Route path="/offsets/checkout" element={<CheckoutPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/builder" element={<ReportBuilderPage />} />

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
  return <Navigate to={auth.isAuthenticated ? '/emissions' : '/'} replace />;
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
