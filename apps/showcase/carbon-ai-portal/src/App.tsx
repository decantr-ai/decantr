import { Routes, Route } from 'react-router-dom';
import { ShowcaseChrome } from './showcase-chrome';
import { LandingPage } from './pages/landing';
import { ChatPage } from './pages/chat';
import { NewChatPage } from './pages/new-chat';
import { DashboardPage } from './pages/dashboard';
import { SettingsPage } from './pages/settings';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import {
  AboutPage,
  ContactPage,
  PrivacyPage,
  TermsPage,
  CookiesPage,
} from './pages/stubs';

export function App() {
  return (
    <ShowcaseChrome>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/new" element={<NewChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/:section" element={<SettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route
          path="*"
          element={
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: 'var(--d-text-muted)',
              }}
            >
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Not Found
              </h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </ShowcaseChrome>
  );
}
