import { LegalPage } from '../components/LegalPage';

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="March 1, 2026" sections={[
      { id: 'overview', title: 'Overview', body: 'We collect only what we need to run Lumen and keep your team\'s work safe.' },
      { id: 'data', title: 'What we collect', body: 'Account details, workspace content, and usage telemetry to improve the product.' },
      { id: 'use', title: 'How we use data', body: 'We use data to operate the service, prevent abuse, and improve Lumen. We do not sell it.' },
      { id: 'sharing', title: 'Sharing', body: 'We share data with processors required to run Lumen (hosting, email, analytics). Full list on request.' },
      { id: 'retention', title: 'Retention', body: 'We keep data while your workspace is active. Deleted content is removed within 30 days.' },
      { id: 'rights', title: 'Your rights', body: 'Request export, correction, or deletion of your data at any time.' },
      { id: 'contact', title: 'Contact', body: 'Email privacy@lumen.team for privacy questions.' },
    ]} />
  );
}
