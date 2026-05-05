import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthContext } from './hooks/useAuth';
import { TopNavFooter } from './shells/TopNavFooter';
import { Centered } from './shells/Centered';
import { ChatPortal } from './shells/ChatPortal';
import { HomePage } from './pages/marketing/HomePage';
import { AboutPage } from './pages/marketing/AboutPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { PrivacyPage, TermsPage, CookiesPage } from './pages/legal/LegalPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';
import { PhoneVerifyPage } from './pages/auth/PhoneVerifyPage';
import { ChatPage } from './pages/chat/ChatPage';
import { NewChatPage } from './pages/chat/NewChatPage';
import { SettingsLayout } from './pages/settings/SettingsLayout';
import { ProfilePage } from './pages/settings/ProfilePage';
import { SecurityPage } from './pages/settings/SecurityPage';
import { PreferencesPage } from './pages/settings/PreferencesPage';
import { DangerPage } from './pages/settings/DangerPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('decantr_authenticated') === 'true'
  );

  const login = useCallback(() => {
    localStorage.setItem('decantr_authenticated', 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('decantr_authenticated');
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <HashRouter>
        <Routes>
          {/* Public zone */}
          <Route element={<TopNavFooter />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
          </Route>

          {/* Gateway zone */}
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

          {/* App zone — chat-portal shell */}
          <Route element={<ChatPortal />}>
            <Route path="/chat" element={<NewChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route element={<SettingsLayout />}>
              <Route path="/settings/profile" element={<ProfilePage />} />
              <Route path="/settings/security" element={<SecurityPage />} />
              <Route path="/settings/preferences" element={<PreferencesPage />} />
              <Route path="/settings/account" element={<DangerPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
