import { Routes, Route } from 'react-router-dom';
import { ShowcaseChrome } from './showcase-chrome';
import {
  HomePage,
  LogsPage,
  GroupedLogsPage,
  MetricsPage,
  MetricDetailPage,
  ConfigPage,
  ConfigDiffPage,
  LandingPage,
  DocsPage,
  LoginPage,
  RegisterPage,
  PrivacyPage,
  TermsPage,
  CookiesPage,
} from './pages/stubs';

export function App() {
  return (
    <ShowcaseChrome>
      <Routes>
        {/* marketing-devtool (public) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* terminal-home (primary) */}
        <Route path="/app" element={<HomePage />} />

        {/* log-viewer (auxiliary) */}
        <Route path="/app/logs" element={<LogsPage />} />
        <Route path="/app/logs/grouped" element={<GroupedLogsPage />} />

        {/* metrics-monitor (auxiliary) */}
        <Route path="/app/metrics" element={<MetricsPage />} />
        <Route path="/app/metrics/:id" element={<MetricDetailPage />} />

        {/* config-editor (auxiliary) */}
        <Route path="/app/config" element={<ConfigPage />} />
        <Route path="/app/config/diff" element={<ConfigDiffPage />} />

        {/* auth-full (gateway) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
                fontFamily: 'var(--d-font-mono)',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Not Found
              </h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </ShowcaseChrome>
  );
}
