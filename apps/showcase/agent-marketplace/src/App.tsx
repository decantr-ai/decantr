import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarMainShell } from './components/shells/SidebarMainShell';
import { CenteredShell } from './components/shells/CenteredShell';
import { TopNavFooterShell } from './components/shells/TopNavFooterShell';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { MfaSetup } from './pages/auth/MfaSetup';
import { MfaVerify } from './pages/auth/MfaVerify';
import { PhoneVerify } from './pages/auth/PhoneVerify';

// Marketing pages
import { Home } from './pages/marketing/Home';

// Agent orchestrator pages
import { AgentOverview } from './pages/agent-orchestrator/AgentOverview';
import { AgentDetail } from './pages/agent-orchestrator/AgentDetail';
import { AgentConfig } from './pages/agent-orchestrator/AgentConfig';
import { AgentMarketplace } from './pages/agent-orchestrator/AgentMarketplace';

// AI transparency pages
import { ModelOverview } from './pages/transparency/ModelOverview';
import { InferenceLog } from './pages/transparency/InferenceLog';
import { ConfidenceExplorer } from './pages/transparency/ConfidenceExplorer';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = (() => {
    try {
      const stored = localStorage.getItem('agent-marketplace-auth');
      if (stored) return JSON.parse(stored).isAuthenticated === true;
    } catch { /* ignore */ }
    return false;
  })();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public — marketing */}
        <Route element={<TopNavFooterShell />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Gateway — auth */}
        <Route element={<CenteredShell />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/mfa-setup" element={<MfaSetup />} />
          <Route path="/mfa-verify" element={<MfaVerify />} />
          <Route path="/phone-verify" element={<PhoneVerify />} />
        </Route>

        {/* App — auth-gated sidebar */}
        <Route
          element={
            <RequireAuth>
              <SidebarMainShell />
            </RequireAuth>
          }
        >
          <Route path="/agents" element={<AgentOverview />} />
          <Route path="/agents/config" element={<AgentConfig />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/marketplace" element={<AgentMarketplace />} />
          <Route path="/transparency" element={<ModelOverview />} />
          <Route path="/transparency/inference" element={<InferenceLog />} />
          <Route path="/transparency/confidence" element={<ConfidenceExplorer />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
