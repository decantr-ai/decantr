import { LegalLayout } from './LegalLayout';

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="March 1, 2026" sections={[
      { id: 'acceptance', heading: 'Acceptance', body: 'By using Canvas you agree to these terms. If you don\'t agree, don\'t use the service — that\'s fine too.' },
      { id: 'account', heading: 'Your account', body: 'Keep your credentials secure. You\'re responsible for activity on your account. We\'ll help you recover if something goes wrong.' },
      { id: 'content', heading: 'Your content', body: 'You own your content. You grant us a license to host, display, and deliver it to your subscribers. That license ends when you delete the content.' },
      { id: 'fees', heading: 'Fees & payouts', body: 'We take 8% of gross subscription revenue. Stripe takes processing fees (~2.9% + 30¢). You keep the rest. Payouts are weekly.' },
      { id: 'prohibited', heading: 'Prohibited content', body: 'No illegal content, no harassment, no CSAM, no content that violates another person\'s IP. We\'ll remove accounts that violate this.' },
      { id: 'termination', heading: 'Termination', body: 'You can leave anytime. We can terminate accounts for policy violations. We\'ll always export your data first.' },
    ]} />
  );
}
