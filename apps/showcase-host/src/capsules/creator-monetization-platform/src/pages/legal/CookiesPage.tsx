import { LegalLayout } from './LegalLayout';

export function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" updated="March 1, 2026" sections={[
      { id: 'what', heading: 'What cookies are', body: 'Small text files your browser stores to remember you between page loads.' },
      { id: 'what-we-use', heading: 'What we use', body: 'A single session cookie to keep you signed in. No advertising cookies. No tracking pixels.' },
      { id: 'third-party', heading: 'Third-party', body: 'Stripe sets cookies on checkout pages for fraud prevention. That\'s unavoidable.' },
      { id: 'control', heading: 'Your control', body: 'Disable cookies in your browser settings. Canvas will still work, but you\'ll sign in each session.' },
    ]} />
  );
}
