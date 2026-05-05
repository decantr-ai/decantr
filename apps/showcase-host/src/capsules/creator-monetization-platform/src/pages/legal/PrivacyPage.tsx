import { LegalLayout } from './LegalLayout';

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="March 1, 2026" sections={[
      { id: 'overview', heading: 'Overview', body: 'Canvas collects the minimum data needed to run your creator business. We never sell your subscriber list. We never use your content to train AI models without explicit opt-in.' },
      { id: 'collection', heading: 'What we collect', body: 'Account info (email, name), billing info (via Stripe), content you publish, engagement metrics on that content, and basic analytics (page views, referrers) for your dashboard.' },
      { id: 'usage', heading: 'How we use it', body: 'To operate the service, send payouts, deliver fan notifications, and improve the product. That\'s it.' },
      { id: 'sharing', heading: 'Sharing', body: 'Stripe (payments), Postmark (email), Cloudflare (delivery). Nobody else. No analytics trackers, no ad networks.' },
      { id: 'rights', heading: 'Your rights', body: 'Export your data any time. Delete your account with a click. We comply with GDPR, CCPA, and PIPEDA.' },
      { id: 'contact', heading: 'Contact', body: 'Privacy questions: privacy@canvas.example. We reply within 72 hours.' },
    ]} />
  );
}
