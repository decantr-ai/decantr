import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { TopNavFooter } from '@/shells/TopNavFooter';
import { SidebarMain } from '@/shells/SidebarMain';
import { Centered } from '@/shells/Centered';

import { HomePage } from '@/pages/HomePage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

import { ProjectsPage } from '@/pages/ProjectsPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { CharactersPage } from '@/pages/CharactersPage';
import { CharacterDetailPage } from '@/pages/CharacterDetailPage';
import { PromptsPage } from '@/pages/PromptsPage';
import { PromptDetailPage } from '@/pages/PromptDetailPage';
import { RendersPage } from '@/pages/RendersPage';
import { RenderDetailPage } from '@/pages/RenderDetailPage';
import { EditorPage } from '@/pages/EditorPage';
import { EditorDetailPage } from '@/pages/EditorDetailPage';
import { ExportPage } from '@/pages/ExportPage';

import { ProfilePage } from '@/pages/settings/ProfilePage';
import { SecurityPage } from '@/pages/settings/SecurityPage';
import { PreferencesPage } from '@/pages/settings/PreferencesPage';
import { DangerPage } from '@/pages/settings/DangerPage';

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

      {/* App — sidebar-main */}
      <Route element={<SidebarMain />}>
        {/* Project Library */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/templates" element={<TemplatesPage />} />

        {/* Character Library */}
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/:id" element={<CharacterDetailPage />} />

        {/* Prompt Director */}
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/prompts/:id" element={<PromptDetailPage />} />

        {/* Render Monitor */}
        <Route path="/renders" element={<RendersPage />} />
        <Route path="/renders/:id" element={<RenderDetailPage />} />

        {/* Video Editor */}
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/export" element={<ExportPage />} />
        <Route path="/editor/:id" element={<EditorDetailPage />} />

        {/* Settings */}
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/security" element={<SecurityPage />} />
        <Route path="/settings/preferences" element={<PreferencesPage />} />
        <Route path="/settings/danger" element={<DangerPage />} />
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
