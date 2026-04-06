import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { TopNavFooter } from '@/shells/TopNavFooter';

/* team-operations (primary) */
import { TeamOverviewPage } from '@/pages/TeamOverviewPage';
import { RosterPage } from '@/pages/RosterPage';
import { PlayerDetailPage } from '@/pages/PlayerDetailPage';

/* scrim-scheduler (auxiliary) */
import { ScrimsPage } from '@/pages/ScrimsPage';
import { MatchDetailPage } from '@/pages/MatchDetailPage';

/* vod-review (auxiliary) */
import { VodsPage } from '@/pages/VodsPage';
import { VodDetailPage } from '@/pages/VodDetailPage';

/* sponsor-dashboard (auxiliary) */
import { SponsorsPage } from '@/pages/SponsorsPage';
import { SponsorDetailPage } from '@/pages/SponsorDetailPage';

/* marketing-esports (public) */
import { HomePage } from '@/pages/HomePage';

/* auth-full (gateway) */
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/PhoneVerifyPage';

/* settings-full (auxiliary) */
import { SettingsProfilePage } from '@/pages/SettingsProfilePage';
import { SettingsSecurityPage } from '@/pages/SettingsSecurityPage';
import { SettingsPreferencesPage } from '@/pages/SettingsPreferencesPage';
import { SettingsDangerPage } from '@/pages/SettingsDangerPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public zone — top-nav-footer shell */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway zone — centered shell */}
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

      {/* App zone — sidebar-main shell */}
      <Route element={<SidebarMain />}>
        {/* team-operations (primary) */}
        <Route path="/team" element={<TeamOverviewPage />} />
        <Route path="/team/roster" element={<RosterPage />} />
        <Route path="/team/players/:id" element={<PlayerDetailPage />} />

        {/* scrim-scheduler (auxiliary) */}
        <Route path="/scrims" element={<ScrimsPage />} />
        <Route path="/scrims/:id" element={<MatchDetailPage />} />

        {/* vod-review (auxiliary) */}
        <Route path="/vods" element={<VodsPage />} />
        <Route path="/vods/:id" element={<VodDetailPage />} />

        {/* sponsor-dashboard (auxiliary) */}
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/sponsors/:id" element={<SponsorDetailPage />} />

        {/* settings-full (auxiliary) */}
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
  return <Navigate to={auth.isAuthenticated ? '/team' : '/'} replace />;
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
