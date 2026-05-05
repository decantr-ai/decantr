import { Routes, Route } from 'react-router-dom';
import { ShowcaseChrome } from './showcase-chrome';
import { AuthGuard } from './components/AuthGuard';

// Marketing (public)
import { LandingPage } from './pages/marketing-devtool/LandingPage';
import { DocsPage } from './pages/marketing-devtool/DocsPage';

// Auth (gateway)
import { LoginPage } from './pages/auth-full/LoginPage';
import { RegisterPage } from './pages/auth-full/RegisterPage';
import { ForgotPasswordPage } from './pages/auth-full/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth-full/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth-full/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth-full/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth-full/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth-full/PhoneVerifyPage';

// Terminal Home (primary)
import { HomePage } from './pages/terminal-home/HomePage';

// Log Viewer (auxiliary)
import { LogsPage } from './pages/log-viewer/LogsPage';
import { GroupedLogsPage } from './pages/log-viewer/GroupedLogsPage';

// Metrics Monitor (auxiliary)
import { MetricsPage } from './pages/metrics-monitor/MetricsPage';
import { MetricDetailPage } from './pages/metrics-monitor/MetricDetailPage';

// Config Editor (auxiliary)
import { ConfigPage } from './pages/config-editor/ConfigPage';
import { ConfigDiffPage } from './pages/config-editor/ConfigDiffPage';

// Legal (public)
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { TermsPage } from './pages/legal/TermsPage';
import { CookiesPage } from './pages/legal/CookiesPage';

export function App() {
  return (
    <ShowcaseChrome>
      <Routes>
        {/* marketing-devtool (public) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* auth-full (gateway) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route path="/phone-verify" element={<PhoneVerifyPage />} />

        {/* terminal-home (primary, auth-guarded) */}
        <Route
          path="/app"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />

        {/* log-viewer (auxiliary, auth-guarded) */}
        <Route
          path="/app/logs"
          element={
            <AuthGuard>
              <LogsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/logs/grouped"
          element={
            <AuthGuard>
              <GroupedLogsPage />
            </AuthGuard>
          }
        />

        {/* metrics-monitor (auxiliary, auth-guarded) */}
        <Route
          path="/app/metrics"
          element={
            <AuthGuard>
              <MetricsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/metrics/:id"
          element={
            <AuthGuard>
              <MetricDetailPage />
            </AuthGuard>
          }
        />

        {/* config-editor (auxiliary, auth-guarded) */}
        <Route
          path="/app/config"
          element={
            <AuthGuard>
              <ConfigPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/config/diff"
          element={
            <AuthGuard>
              <ConfigDiffPage />
            </AuthGuard>
          }
        />

        {/* legal (public) */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: 'var(--d-text-muted)',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                404 — NOT FOUND
              </h2>
              <p style={{ fontSize: 14 }}>
                The page you are looking for does not exist.
              </p>
            </div>
          }
        />
      </Routes>
    </ShowcaseChrome>
  );
}
