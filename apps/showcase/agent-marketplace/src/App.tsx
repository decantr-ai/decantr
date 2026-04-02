import { Routes, Route } from 'react-router-dom';
import { SidebarMainShell } from './layouts/SidebarMainShell';
import { CenteredShell } from './layouts/CenteredShell';
import { TopNavFooterShell } from './layouts/TopNavFooterShell';
import { AgentOverview } from './pages/agents/AgentOverview';
import { AgentDetail } from './pages/agents/AgentDetail';
import { AgentConfig } from './pages/agents/AgentConfig';
import { AgentMarketplace } from './pages/agents/AgentMarketplace';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { MfaSetup } from './pages/auth/MfaSetup';
import { MfaVerify } from './pages/auth/MfaVerify';
import { PhoneVerify } from './pages/auth/PhoneVerify';
import { Home } from './pages/marketing/Home';
import { ModelOverview } from './pages/transparency/ModelOverview';
import { InferenceLog } from './pages/transparency/InferenceLog';
import { ConfidenceExplorer } from './pages/transparency/ConfidenceExplorer';

export function App() {
  return (
    <Routes>
      {/* Marketing — top-nav-footer shell */}
      <Route element={<TopNavFooterShell />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Auth — centered shell */}
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

      {/* Agent Orchestrator — sidebar-main shell */}
      <Route element={<SidebarMainShell section="agents" />}>
        <Route path="/agents" element={<AgentOverview />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/agents/config" element={<AgentConfig />} />
        <Route path="/marketplace" element={<AgentMarketplace />} />
      </Route>

      {/* AI Transparency — sidebar-main shell */}
      <Route element={<SidebarMainShell section="transparency" />}>
        <Route path="/transparency" element={<ModelOverview />} />
        <Route path="/transparency/inference" element={<InferenceLog />} />
        <Route path="/transparency/confidence" element={<ConfidenceExplorer />} />
      </Route>
    </Routes>
  );
}
