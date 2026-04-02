import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { css } from '@decantr/css';

import './styles/tokens.css';
import './styles/treatments.css';
import './styles/global.css';

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

// Ensure css runtime is initialized
void css('_flex');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        {/* Marketing (public) — top-nav-footer shell */}
        <Route element={<TopNavFooterLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth (gateway) — centered shell */}
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

        {/* Agent Orchestrator (primary) — sidebar-main shell */}
        <Route element={<SidebarMainLayout />}>
          <Route path="/agents" element={<AgentOverview />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/agents/config" element={<AgentConfig />} />
          <Route path="/marketplace" element={<AgentMarketplace />} />
        </Route>

        {/* AI Transparency (auxiliary) — sidebar-main shell */}
        <Route element={<SidebarMainLayout />}>
          <Route path="/transparency" element={<ModelOverview />} />
          <Route path="/transparency/inference" element={<InferenceLog />} />
          <Route path="/transparency/confidence" element={<ConfidenceExplorer />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);
