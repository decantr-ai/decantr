import { LegalProse } from '@/components/LegalProse';

export function CookiesPage() {
  return (
    <LegalProse
      title="Cookie Policy"
      lastUpdated="April 1, 2026"
      sections={[
        { id: 'what', title: 'What are cookies', body: ['Cookies are small text files stored on your device when you visit a website. They help us remember preferences and authenticate sessions.'] },
        { id: 'essential', title: 'Essential cookies', body: ['We use session cookies for authentication and CSRF protection. These cannot be disabled.'] },
        { id: 'analytics', title: 'Analytics', body: ['We use privacy-respecting analytics (self-hosted Plausible) to understand how the product is used. No personal data is transmitted.'] },
        { id: 'preferences', title: 'Preferences', body: ['We store your theme, language, and layout preferences in localStorage.'] },
        { id: 'managing', title: 'Managing cookies', body: ['You can clear cookies via your browser settings at any time. Disabling essential cookies will sign you out.'] },
      ]}
    />
  );
}
