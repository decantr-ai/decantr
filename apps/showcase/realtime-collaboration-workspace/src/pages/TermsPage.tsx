import { LegalPage } from '../components/LegalPage';

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="March 1, 2026" sections={[
      { id: 'acceptance', title: 'Acceptance', body: 'By using Lumen you agree to these terms. If you don\'t, please don\'t use the service.' },
      { id: 'accounts', title: 'Accounts', body: 'You\'re responsible for your account. Keep credentials secure and notify us of unauthorized access.' },
      { id: 'content', title: 'Your content', body: 'You own your content. You grant us the rights needed to host and display it for your team.' },
      { id: 'acceptable', title: 'Acceptable use', body: 'No illegal, abusive, or infringing content. No scraping, no resale without permission.' },
      { id: 'billing', title: 'Billing', body: 'Paid plans are billed in advance. Cancel anytime — refunds are prorated.' },
      { id: 'liability', title: 'Liability', body: 'Lumen is provided "as is". We limit our liability as permitted by law.' },
      { id: 'changes', title: 'Changes', body: 'We may update these terms. We\'ll email you about material changes.' },
    ]} />
  );
}
