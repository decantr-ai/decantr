import { Routes, Route } from 'react-router-dom';
import { PageChrome } from './components/PageChrome';
import { AuthGuard } from './components/AuthGuard';

// marketing-pipeline (public)
import { HomePage } from './pages/marketing-pipeline/HomePage';

// auth-full (gateway)
import { LoginPage } from './pages/auth-full/LoginPage';
import { RegisterPage } from './pages/auth-full/RegisterPage';
import { ForgotPasswordPage } from './pages/auth-full/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth-full/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth-full/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth-full/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth-full/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth-full/PhoneVerifyPage';

// pipeline-builder (primary, terminal-split)
import { PipelinesPage } from './pages/pipeline-builder/PipelinesPage';
import { PipelineEditorPage } from './pages/pipeline-builder/PipelineEditorPage';
import { PipelineConfigPage } from './pages/pipeline-builder/PipelineConfigPage';

// source-catalog (sidebar-main)
import { SourcesPage } from './pages/source-catalog/SourcesPage';
import { SourceDetailPage } from './pages/source-catalog/SourceDetailPage';
import { ConnectionsPage } from './pages/source-catalog/ConnectionsPage';

// transformation-editor (sidebar-aside)
import { TransformsPage } from './pages/transformation-editor/TransformsPage';
import { TransformEditorPage } from './pages/transformation-editor/TransformEditorPage';
import { DataPreviewPage } from './pages/transformation-editor/DataPreviewPage';

// job-monitor (sidebar-main)
import { JobsPage } from './pages/job-monitor/JobsPage';
import { JobDetailPage } from './pages/job-monitor/JobDetailPage';

// settings-full (terminal-split)
import { ProfilePage } from './pages/settings-full/ProfilePage';
import { SecurityPage } from './pages/settings-full/SecurityPage';
import { PreferencesPage } from './pages/settings-full/PreferencesPage';
import { DangerPage } from './pages/settings-full/DangerPage';

export function App() {
  return (
    <PageChrome>
      <Routes>
        {/* marketing-pipeline */}
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

        {/* pipeline-builder */}
        <Route path="/pipelines" element={<AuthGuard><PipelinesPage /></AuthGuard>} />
        <Route path="/pipelines/:id" element={<AuthGuard><PipelineEditorPage /></AuthGuard>} />
        <Route path="/pipelines/:id/config" element={<AuthGuard><PipelineConfigPage /></AuthGuard>} />

        {/* source-catalog */}
        <Route path="/sources" element={<AuthGuard><SourcesPage /></AuthGuard>} />
        <Route path="/sources/:id" element={<AuthGuard><SourceDetailPage /></AuthGuard>} />
        <Route path="/connections" element={<AuthGuard><ConnectionsPage /></AuthGuard>} />

        {/* transformation-editor */}
        <Route path="/transforms" element={<AuthGuard><TransformsPage /></AuthGuard>} />
        <Route path="/transforms/preview" element={<AuthGuard><DataPreviewPage /></AuthGuard>} />
        <Route path="/transforms/:id" element={<AuthGuard><TransformEditorPage /></AuthGuard>} />

        {/* job-monitor */}
        <Route path="/jobs" element={<AuthGuard><JobsPage /></AuthGuard>} />
        <Route path="/jobs/:id" element={<AuthGuard><JobDetailPage /></AuthGuard>} />

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
              <h2 className="term-glow" style={{ fontSize: 18, fontWeight: 600, color: 'var(--d-primary)', marginBottom: 8 }}>
                ERR 404 — NOT FOUND
              </h2>
              <p style={{ fontSize: 14 }}>$ route not found in dispatcher</p>
            </div>
          }
        />
      </Routes>
    </PageChrome>
  );
}
