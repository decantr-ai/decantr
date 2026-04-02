import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { CenteredLayout } from './layouts/CenteredLayout';
import { ChatPortalLayout } from './layouts/ChatPortalLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiesPage } from './pages/CookiesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MfaSetupPage } from './pages/MfaSetupPage';
import { MfaVerifyPage } from './pages/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/PhoneVerifyPage';
import { NewChatPage } from './pages/NewChatPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SecurityPage } from './pages/SecurityPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { DangerPage } from './pages/DangerPage';

export function App() {
  return (
    <>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <Routes>
        {/* Public zone - top-nav-footer shell */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Route>

        {/* Gateway zone - centered shell */}
        <Route element={<CenteredLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
          <Route path="/phone-verify" element={<PhoneVerifyPage />} />
        </Route>

        {/* App zone - chat-portal shell */}
        <Route element={<ChatPortalLayout />}>
          <Route path="/chat" element={<NewChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/security" element={<SecurityPage />} />
          <Route path="/settings/preferences" element={<PreferencesPage />} />
          <Route path="/settings/account" element={<DangerPage />} />
        </Route>
      </Routes>
    </>
  );
}
