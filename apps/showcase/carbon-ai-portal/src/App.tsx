import { Routes, Route } from 'react-router-dom';

// Layouts
import { TopNavFooterShell } from '@/layouts/TopNavFooterShell';
import { CenteredShell } from '@/layouts/CenteredShell';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';

// Marketing (public)
import { HomePage } from '@/pages/marketing/HomePage';
import { AboutPage } from '@/pages/about/AboutPage';
import { ContactPage } from '@/pages/contact/ContactPage';

// Legal (public)
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { CookiesPage } from '@/pages/legal/CookiesPage';

// Auth (gateway)
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { MfaSetupPage } from '@/pages/auth/MfaSetupPage';
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from '@/pages/auth/PhoneVerifyPage';

// Chat (app - primary)
import { ChatPage } from '@/pages/chat/ChatPage';
import { NewChatPage } from '@/pages/chat/NewChatPage';

// Settings (app - auxiliary)
import { ProfilePage } from '@/pages/settings/ProfilePage';
import { SecurityPage } from '@/pages/settings/SecurityPage';
import { PreferencesPage } from '@/pages/settings/PreferencesPage';
import { DangerPage } from '@/pages/settings/DangerPage';

export function App() {
  return (
    <Routes>
      {/* Public zone — top-nav-footer shell */}
      <Route element={<TopNavFooterShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
      </Route>

      {/* Gateway zone — centered shell */}
      <Route element={<CenteredShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-verify" element={<MfaVerifyPage />} />
        <Route path="/phone-verify" element={<PhoneVerifyPage />} />
      </Route>

      {/* App zone — chat-portal shell */}
      <Route element={<ChatPortalShell />}>
        <Route path="/chat" element={<NewChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/security" element={<SecurityPage />} />
        <Route path="/settings/preferences" element={<PreferencesPage />} />
        <Route path="/settings/account" element={<DangerPage />} />
      </Route>
    </Routes>
  );
}
