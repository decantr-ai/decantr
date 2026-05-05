import { Routes, Route } from 'react-router-dom';
import { PageChrome } from './components/PageChrome';
import { AuthGuard } from './components/AuthGuard';

// marketing-producer (public)
import { HomePage } from './pages/marketing-producer/HomePage';

// auth-full (gateway)
import { LoginPage } from './pages/auth-full/LoginPage';
import { RegisterPage } from './pages/auth-full/RegisterPage';
import { ForgotPasswordPage } from './pages/auth-full/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth-full/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth-full/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth-full/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth-full/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth-full/PhoneVerifyPage';

// music-workspace (primary, sidebar-aside)
import { SessionPage } from './pages/music-workspace/SessionPage';
import { SessionDetailPage } from './pages/music-workspace/SessionDetailPage';

// track-library (auxiliary, sidebar-main)
import { TracksPage } from './pages/track-library/TracksPage';
import { TrackDetailPage } from './pages/track-library/TrackDetailPage';

// collaboration-hub (auxiliary, sidebar-main)
import { CollaboratorsPage } from './pages/collaboration-hub/CollaboratorsPage';
import { SplitsPage } from './pages/collaboration-hub/SplitsPage';

// session-rooms (auxiliary, sidebar-main)
import { RoomsPage } from './pages/session-rooms/RoomsPage';
import { RoomDetailPage } from './pages/session-rooms/RoomDetailPage';

// settings-full (auxiliary, sidebar-aside)
import { ProfilePage } from './pages/settings-full/ProfilePage';
import { SecurityPage } from './pages/settings-full/SecurityPage';
import { PreferencesPage } from './pages/settings-full/PreferencesPage';
import { DangerPage } from './pages/settings-full/DangerPage';

export function App() {
  return (
    <PageChrome>
      <Routes>
        {/* marketing-producer */}
        <Route path="/" element={<HomePage />} />

        {/* auth-full */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route path="/phone-verify" element={<PhoneVerifyPage />} />

        {/* music-workspace */}
        <Route path="/session" element={<AuthGuard><SessionPage /></AuthGuard>} />
        <Route path="/session/:id" element={<AuthGuard><SessionDetailPage /></AuthGuard>} />

        {/* track-library */}
        <Route path="/tracks" element={<AuthGuard><TracksPage /></AuthGuard>} />
        <Route path="/tracks/:id" element={<AuthGuard><TrackDetailPage /></AuthGuard>} />

        {/* collaboration-hub */}
        <Route path="/collab" element={<AuthGuard><CollaboratorsPage /></AuthGuard>} />
        <Route path="/collab/splits" element={<AuthGuard><SplitsPage /></AuthGuard>} />

        {/* session-rooms */}
        <Route path="/rooms" element={<AuthGuard><RoomsPage /></AuthGuard>} />
        <Route path="/rooms/:id" element={<AuthGuard><RoomDetailPage /></AuthGuard>} />

        {/* settings-full */}
        <Route path="/settings/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
        <Route path="/settings/security" element={<AuthGuard><SecurityPage /></AuthGuard>} />
        <Route path="/settings/preferences" element={<AuthGuard><PreferencesPage /></AuthGuard>} />
        <Route path="/settings/danger" element={<AuthGuard><DangerPage /></AuthGuard>} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: 'var(--d-text-muted)',
                fontFamily: 'inherit',
              }}
            >
              <h2 className="studio-glow-cyan" style={{ fontSize: 18, fontWeight: 600, color: 'var(--d-primary)', marginBottom: 8 }}>
                404 — Track Not Found
              </h2>
              <p style={{ fontSize: 14 }}>This session doesn't exist. Check your routing.</p>
            </div>
          }
        />
      </Routes>
    </PageChrome>
  );
}
