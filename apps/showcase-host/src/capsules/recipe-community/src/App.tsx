import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavFooter } from './shells/TopNavFooter';
import { TopNavMain } from './shells/TopNavMain';
import { SidebarMain } from './shells/SidebarMain';
import { MinimalHeader } from './shells/MinimalHeader';
import { Centered } from './shells/Centered';
import { SidebarAside } from './shells/SidebarAside';

import { HomePage } from './pages/HomePage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CookingPage } from './pages/CookingPage';
import { CreateRecipePage } from './pages/CreateRecipePage';
import { MyRecipesPage } from './pages/MyRecipesPage';
import { FeedPage } from './pages/FeedPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProfilePage } from './pages/ProfilePage';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';

import { SettingsProfilePage } from './pages/settings/SettingsProfilePage';
import { SettingsSecurityPage } from './pages/settings/SettingsSecurityPage';
import { SettingsPreferencesPage } from './pages/settings/SettingsPreferencesPage';
import { SettingsDangerPage } from './pages/settings/SettingsDangerPage';

import { useAuth } from './hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/recipes" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public zone — top-nav-footer */}
        <Route element={<TopNavFooter />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Gateway zone — centered */}
        <Route element={<GuestGuard><Centered /></GuestGuard>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        </Route>

        {/* App zone — top-nav-main (recipe-browser primary + recipe-social + settings) */}
        <Route element={<AuthGuard><TopNavMain /></AuthGuard>}>
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route element={<SidebarAside />}>
            <Route path="/settings/profile" element={<SettingsProfilePage />} />
            <Route path="/settings/security" element={<SettingsSecurityPage />} />
            <Route path="/settings/preferences" element={<SettingsPreferencesPage />} />
            <Route path="/settings/danger" element={<SettingsDangerPage />} />
          </Route>
        </Route>

        {/* App auxiliary — sidebar-main (recipe-creator) */}
        <Route element={<AuthGuard><SidebarMain /></AuthGuard>}>
          <Route path="/recipes/create" element={<CreateRecipePage />} />
          <Route path="/my-recipes" element={<MyRecipesPage />} />
        </Route>

        {/* App auxiliary — minimal-header (cook-mode) */}
        <Route element={<AuthGuard><MinimalHeader /></AuthGuard>}>
          <Route path="/recipes/:id/cook" element={<CookingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
