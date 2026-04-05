import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { TopNavMain } from './shells/TopNavMain';
import { SidebarMain } from './shells/SidebarMain';
import { MinimalHeader } from './shells/MinimalHeader';
import { Centered } from './shells/Centered';
import { SidebarAside } from './shells/SidebarAside';

import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { FeedPage } from './pages/FeedPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { MembersPage } from './pages/MembersPage';
import { TicketsPage } from './pages/TicketsPage';

import { OrgOverviewPage } from './pages/organizer/OrgOverviewPage';
import { OrgEventEditPage } from './pages/organizer/OrgEventEditPage';
import { OrgAttendeesPage } from './pages/organizer/OrgAttendeesPage';
import { OrgAnalyticsPage } from './pages/organizer/OrgAnalyticsPage';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';

import { SettingsProfilePage } from './pages/settings/SettingsProfilePage';
import { SettingsSecurityPage } from './pages/settings/SettingsSecurityPage';
import { SettingsPreferencesPage } from './pages/settings/SettingsPreferencesPage';
import { SettingsDangerPage } from './pages/settings/SettingsDangerPage';

import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/events" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer (marketing-events) */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Gateway zone — centered (auth-full) */}
        <Route element={<GuestGuard><Centered /></GuestGuard>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
          <Route path="/phone-verify" element={<PhoneVerifyPage />} />
        </Route>

        {/* App zone — top-nav-main (event-discovery primary + community-feed + settings) */}
        <Route element={<AuthGuard><TopNavMain /></AuthGuard>}>
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/:id" element={<PostDetailPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route element={<SidebarAside />}>
            <Route path="/settings/profile" element={<SettingsProfilePage />} />
            <Route path="/settings/security" element={<SettingsSecurityPage />} />
            <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
            <Route path="/settings/danger" element={<SettingsDangerPage />} />
          </Route>
        </Route>

        {/* App auxiliary — sidebar-main (organizer-dashboard) */}
        <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
          <Route path="/organizer" element={<OrgOverviewPage />} />
          <Route path="/organizer/events/:id/edit" element={<OrgEventEditPage />} />
          <Route path="/organizer/attendees" element={<OrgAttendeesPage />} />
          <Route path="/organizer/analytics" element={<OrgAnalyticsPage />} />
        </Route>

        {/* App auxiliary — minimal-header (ticket-checkout) */}
        <Route element={<AuthGuard><MinimalHeader /></AuthGuard>}>
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
