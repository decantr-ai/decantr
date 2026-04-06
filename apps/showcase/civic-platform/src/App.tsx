import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { TopNavMain } from '@/shells/TopNavMain';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';

import { MarketingHomePage } from '@/pages/MarketingHomePage';
import { AboutPage } from '@/pages/AboutPage';

import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/PhoneVerifyPage';

import { EngageHomePage } from '@/pages/EngageHomePage';
import { PetitionsPage } from '@/pages/PetitionsPage';
import { PetitionDetailPage } from '@/pages/PetitionDetailPage';

import { BudgetPage } from '@/pages/BudgetPage';
import { BudgetCategoryPage } from '@/pages/BudgetCategoryPage';

import { MeetingsPage } from '@/pages/MeetingsPage';
import { MeetingDetailPage } from '@/pages/MeetingDetailPage';

import { RequestsPage } from '@/pages/RequestsPage';
import { NewRequestPage } from '@/pages/NewRequestPage';
import { RequestDetailPage } from '@/pages/RequestDetailPage';

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
        <Route path="/about" element={<AboutPage />} />
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

      {/* App zone — engagement hub + settings (top-nav-main) */}
      <Route element={<TopNavMain />}>
        <Route path="/engage" element={<EngageHomePage />} />
        <Route path="/engage/petitions" element={<PetitionsPage />} />
        <Route path="/engage/petitions/:id" element={<PetitionDetailPage />} />
        <Route path="/settings/profile" element={<SettingsProfilePage />} />
        <Route path="/settings/security" element={<SettingsSecurityPage />} />
        <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
        <Route path="/settings/danger" element={<SettingsDangerPage />} />
      </Route>

      {/* App zone — sidebar sections (budget, meetings, requests) */}
      <Route element={<SidebarMain />}>
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/budget/:category" element={<BudgetCategoryPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/meetings/:id" element={<MeetingDetailPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function DefaultRedirect() {
  const auth = useAuthProvider();
  return <Navigate to={auth.isAuthenticated ? '/engage' : '/'} replace />;
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
