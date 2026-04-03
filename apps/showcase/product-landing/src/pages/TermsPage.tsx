import { css } from '@decantr/css';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing or using the Lumi platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services. These terms apply to all users, including visitors, registered users, and paying subscribers.',
  },
  {
    title: 'Account Registration',
    content: 'You must provide accurate, complete information when creating an account. You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized access. One person or entity may not maintain more than one free account.',
  },
  {
    title: 'Acceptable Use',
    content: 'You agree to use the platform only for lawful purposes. You may not use the service to distribute malware, conduct denial-of-service attacks, scrape data from other users, or violate the intellectual property rights of others. We reserve the right to suspend accounts that violate these terms.',
  },
  {
    title: 'Intellectual Property',
    content: 'The platform, including its design, code, and documentation, is the intellectual property of Lumi Inc. Your content remains yours. By using the platform, you grant us a limited license to host and process your content as necessary to provide the service. You retain all ownership rights.',
  },
  {
    title: 'Subscription and Billing',
    content: 'Paid plans are billed monthly or annually based on your selection. Prices may change with 30 days notice. You can cancel at any time; access continues until the end of the current billing period. Refunds are provided on a case-by-case basis for annual plans within the first 14 days.',
  },
  {
    title: 'Service Level Agreement',
    content: 'We commit to 99.9% uptime for Pro plans and 99.99% for Enterprise plans, measured monthly. Downtime due to scheduled maintenance (announced 48 hours in advance) is excluded. Service credits are provided for SLA breaches: 10% credit for each 0.1% below the guaranteed uptime.',
  },
  {
    title: 'Limitation of Liability',
    content: 'To the maximum extent permitted by law, Lumi shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability for any claim shall not exceed the amount paid by you in the 12 months preceding the claim.',
  },
  {
    title: 'Termination',
    content: 'Either party may terminate this agreement at any time. Upon termination, you may export your data within 30 days. After 30 days, we will delete your data from our systems. Provisions that by their nature should survive termination (including IP, indemnification, and limitation of liability) shall survive.',
  },
  {
    title: 'Governing Law',
    content: 'These terms are governed by the laws of the State of Delaware, United States. Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Class action waivers apply to the maximum extent permitted by law.',
  },
  {
    title: 'Changes to Terms',
    content: 'We may modify these terms at any time. Material changes will be communicated via email at least 30 days before they take effect. Continued use of the platform after changes become effective constitutes acceptance. If you disagree with changes, you may terminate your account.',
  },
];

export function TermsPage() {
  return (
    <div className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <h1 className={css('_fontbold')} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Terms of Service
        </h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
          Last updated: March 1, 2026
        </p>

        <p style={{ lineHeight: 1.8, marginBottom: '2rem', color: 'var(--d-text)' }}>
          Welcome to Lumi. Please read these Terms of Service carefully before using our platform.
          These terms constitute a legally binding agreement between you and Lumi Inc.
        </p>

        <div className="lum-divider" style={{ marginBottom: '2rem' }} />

        {sections.map((section, i) => (
          <section key={i} style={{ marginBottom: '2rem' }}>
            <h2 className={css('_fontsemi')} style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              {i + 1}. {section.title}
            </h2>
            <p style={{ lineHeight: 1.8, color: 'var(--d-text-muted)' }}>
              {section.content}
            </p>
          </section>
        ))}

        <div className="lum-divider" style={{ margin: '2rem 0' }} />

        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
          Questions about these terms? Contact us at{' '}
          <span style={{ color: 'var(--d-primary)' }}>legal@lumi.dev</span>
        </p>
      </div>
    </div>
  );
}
