import { Routes, Route } from 'react-router-dom';
import { ShowcaseChrome } from './showcase-chrome';
import { SidebarMainShell } from './shells/SidebarMain';
import { CenteredShell } from './shells/Centered';
import { TopNavFooterShell } from './shells/TopNavFooter';
import { CommandPalette } from './components/CommandPalette';
import { HomePage } from './pages/marketing/HomePage';
import { AboutPage } from './pages/marketing/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';
import { AgentOverview } from './pages/agents/AgentOverview';
import { AgentDetail } from './pages/agents/AgentDetail';
import { AgentConfig } from './pages/agents/AgentConfig';
import { AgentMarketplace } from './pages/agents/AgentMarketplace';
import { ModelOverview } from './pages/transparency/ModelOverview';
import { InferenceLog } from './pages/transparency/InferenceLog';
import { ConfidenceExplorer } from './pages/transparency/ConfidenceExplorer';

export function App() {
  return (
    <ShowcaseChrome>
      <CommandPalette />
      <Routes>
        {/* Public zone — top-nav-footer shell */}
        <Route
          path="/"
          element={
            <TopNavFooterShell>
              <HomePage />
            </TopNavFooterShell>
          }
        />

        <Route
          path="/about"
          element={
            <TopNavFooterShell>
              <AboutPage />
            </TopNavFooterShell>
          }
        />

        {/* Gateway zone — centered shell */}
        <Route path="/login" element={<CenteredShell><LoginPage /></CenteredShell>} />
        <Route path="/register" element={<CenteredShell><RegisterPage /></CenteredShell>} />
        <Route path="/forgot-password" element={<CenteredShell><ForgotPasswordPage /></CenteredShell>} />
        <Route path="/reset-password" element={<CenteredShell><ResetPasswordPage /></CenteredShell>} />
        <Route path="/verify-email" element={<CenteredShell><VerifyEmailPage /></CenteredShell>} />
        <Route path="/mfa-setup" element={<CenteredShell><MfaSetupPage /></CenteredShell>} />
        <Route path="/mfa-verify" element={<CenteredShell><MfaVerifyPage /></CenteredShell>} />
        <Route path="/phone-verify" element={<CenteredShell><PhoneVerifyPage /></CenteredShell>} />

        {/* App zone — sidebar-main shell */}
        <Route path="/agents" element={<SidebarMainShell><AgentOverview /></SidebarMainShell>} />
        <Route path="/agents/:id" element={<SidebarMainShell><AgentDetail /></SidebarMainShell>} />
        <Route path="/agents/config" element={<SidebarMainShell><AgentConfig /></SidebarMainShell>} />
        <Route path="/marketplace" element={<SidebarMainShell><AgentMarketplace /></SidebarMainShell>} />

        {/* Auxiliary zone — sidebar-main shell (shared nav) */}
        <Route path="/transparency" element={<SidebarMainShell><ModelOverview /></SidebarMainShell>} />
        <Route path="/transparency/inference" element={<SidebarMainShell><InferenceLog /></SidebarMainShell>} />
        <Route path="/transparency/confidence" element={<SidebarMainShell><ConfidenceExplorer /></SidebarMainShell>} />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            <div
              style={{
                padding: 48,
                textAlign: 'center',
                color: 'var(--d-text-muted)',
                fontFamily: 'var(--d-font-mono)',
                minHeight: 'calc(100vh - 48px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--d-bg)',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>404 — Not Found</h2>
              <p>The requested route does not exist.</p>
            </div>
          }
        />
      </Routes>
    </ShowcaseChrome>
  );
}
