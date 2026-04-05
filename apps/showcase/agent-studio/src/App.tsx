import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';
import { SidebarAsideAgentRoutes } from '@/shells/SidebarAsideAgentRoutes';
import { SidebarAsideSettingsRoutes } from '@/shells/SidebarAsideSettingsRoutes';

import { HomePage } from '@/pages/HomePage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

import { PromptsPage } from '@/pages/PromptsPage';
import { PromptDetailPage } from '@/pages/PromptDetailPage';
import { PromptComparePage } from '@/pages/PromptComparePage';
import { ToolsPage } from '@/pages/ToolsPage';
import { ToolDetailPage } from '@/pages/ToolDetailPage';
import { EvalsPage } from '@/pages/EvalsPage';
import { EvalDetailPage } from '@/pages/EvalDetailPage';
import { EvalComparePage } from '@/pages/EvalComparePage';
import { EvalCreatePage } from '@/pages/EvalCreatePage';
import { TracesPage } from '@/pages/TracesPage';
import { TraceDetailPage } from '@/pages/TraceDetailPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public — top-nav-footer */}
      <Route element={<TopNavFooter />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Gateway — centered */}
      <Route element={<Centered />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route path="/phone-verify" element={<PhoneVerifyPage />} />
      </Route>

      {/* Primary app — sidebar-aside for agent-studio section */}
      <Route path="/agents/*" element={<SidebarAsideAgentRoutes />} />

      {/* Settings — sidebar-aside */}
      <Route path="/settings/*" element={<SidebarAsideSettingsRoutes />} />

      {/* Auxiliary sections — sidebar-main */}
      <Route element={<SidebarMain />}>
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/prompts/compare" element={<PromptComparePage />} />
        <Route path="/prompts/:id" element={<PromptDetailPage />} />

        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:id" element={<ToolDetailPage />} />

        <Route path="/evals" element={<EvalsPage />} />
        <Route path="/evals/create" element={<EvalCreatePage />} />
        <Route path="/evals/compare" element={<EvalComparePage />} />
        <Route path="/evals/:id" element={<EvalDetailPage />} />

        <Route path="/traces" element={<TracesPage />} />
        <Route path="/traces/:id" element={<TraceDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthContext.Provider>
  );
}
