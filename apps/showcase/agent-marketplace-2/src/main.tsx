import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';

import { SidebarMainLayout } from './layouts/SidebarMainLayout';
import { CenteredLayout } from './layouts/CenteredLayout';
import { TopNavFooterLayout } from './layouts/TopNavFooterLayout';

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

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Marketing - top-nav-footer shell */}
        <Route element={<TopNavFooterLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth - centered shell */}
        <Route element={<CenteredLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/mfa-setup" element={<MfaSetup />} />
          <Route path="/mfa-verify" element={<MfaVerify />} />
          <Route path="/phone-verify" element={<PhoneVerify />} />
        </Route>

        {/* Agent Orchestrator + AI Transparency - sidebar-main shell */}
        <Route element={<SidebarMainLayout />}>
          <Route path="/agents" element={<AgentOverview />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/agents/config" element={<AgentConfig />} />
          <Route path="/marketplace" element={<AgentMarketplace />} />
          <Route path="/transparency" element={<ModelOverview />} />
          <Route path="/transparency/inference" element={<InferenceLog />} />
          <Route path="/transparency/confidence" element={<ConfidenceExplorer />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
