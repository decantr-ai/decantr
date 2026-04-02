import { Routes, Route, Navigate } from 'react-router-dom';

/* Chat */
import { ChatPage } from '@/pages/chat/ChatPage';
import { NewChatPage } from '@/pages/chat/NewChatPage';

/* Auth */
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

/* Settings */
import { ProfilePage } from '@/pages/settings/ProfilePage';
import { SecurityPage } from '@/pages/settings/SecurityPage';
import { PreferencesPage } from '@/pages/settings/PreferencesPage';
import { DangerPage } from '@/pages/settings/DangerPage';

/* Marketing */
import { HomePage } from '@/pages/marketing/HomePage';

/* About */
import { AboutPage } from '@/pages/about/AboutPage';

/* Contact */
import { ContactPage } from '@/pages/contact/ContactPage';

/* Legal */
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { CookiesPage } from '@/pages/legal/CookiesPage';

export function App() {
  return (
    <Routes>
      {/* Marketing (public) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth (gateway) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/mfa-setup" element={<MfaSetupPage />} />
      <Route path="/mfa-verify" element={<MfaVerifyPage />} />
      <Route path="/phone-verify" element={<PhoneVerifyPage />} />

      {/* Chat (primary) */}
      <Route path="/chat" element={<NewChatPage />} />
      <Route path="/chat/:id" element={<ChatPage />} />

      {/* Settings (auxiliary) */}
      <Route path="/settings/profile" element={<ProfilePage />} />
      <Route path="/settings/security" element={<SecurityPage />} />
      <Route path="/settings/preferences" element={<PreferencesPage />} />
      <Route path="/settings/account" element={<DangerPage />} />

      {/* Legal (public) */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cookies" element={<CookiesPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
