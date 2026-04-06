import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { FullBleed } from '@/shells/FullBleed';
import { SidebarMain } from '@/shells/SidebarMain';
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
import { AssetsPage } from '@/pages/AssetsPage';
import { AssetDetailPage } from '@/pages/AssetDetailPage';
import { CapTablePage } from '@/pages/CapTablePage';
import { ShareClassDetailPage } from '@/pages/ShareClassDetailPage';
import { OrderBookPage } from '@/pages/OrderBookPage';
import { TradesPage } from '@/pages/TradesPage';
import { TradeDetailPage } from '@/pages/TradeDetailPage';
import { GovernancePage } from '@/pages/GovernancePage';
import { BallotDetailPage } from '@/pages/BallotDetailPage';
import { DividendsPage } from '@/pages/DividendsPage';
import { SettingsProfilePage } from '@/pages/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/SettingsDangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone -- marketing */}
      <Route element={<FullBleed />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway zone -- auth */}
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

      {/* App zone -- sidebar-main */}
      <Route element={<SidebarMain />}>
        {/* portfolio-overview (primary) */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* fractional-assets */}
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />

        {/* cap-table */}
        <Route path="/cap-table" element={<CapTablePage />} />
        <Route path="/cap-table/:id" element={<ShareClassDetailPage />} />

        {/* order-book */}
        <Route path="/order-book" element={<OrderBookPage />} />

        {/* trades */}
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/trades/:id" element={<TradeDetailPage />} />

        {/* governance */}
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/governance/:id" element={<BallotDetailPage />} />

        {/* dividends */}
        <Route path="/dividends" element={<DividendsPage />} />

        {/* settings */}
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
