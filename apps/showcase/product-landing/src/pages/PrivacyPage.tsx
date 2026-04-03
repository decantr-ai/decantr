import { css } from '@decantr/css';

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide directly, such as your name, email address, and payment information when you create an account or make a purchase. We also collect usage data automatically, including browser type, device information, IP address, and interaction patterns within our platform.',
  },
  {
    title: 'How We Use Your Information',
    content: 'We use collected information to provide and improve our services, process transactions, communicate with you about updates and offers, ensure platform security, and comply with legal obligations. We never sell your personal data to third parties.',
  },
  {
    title: 'Data Storage and Security',
    content: 'Your data is encrypted at rest and in transit using industry-standard AES-256 and TLS 1.3 protocols. We store data in SOC 2 Type II certified data centers with geographic redundancy. Access to personal data is restricted to authorized personnel on a need-to-know basis.',
  },
  {
    title: 'Cookies and Tracking',
    content: 'We use essential cookies for authentication and security. Analytics cookies help us understand how the platform is used. You can manage cookie preferences through your browser settings. We respect Do Not Track signals and provide opt-out mechanisms for analytics.',
  },
  {
    title: 'Third-Party Services',
    content: 'We integrate with select third-party services for payment processing, analytics, and infrastructure. Each integration is vetted for security compliance. Our third-party processors are contractually obligated to protect your data and use it only as directed.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, correct, or delete your personal data at any time. You can export your data in machine-readable format. For EU residents, GDPR rights are fully supported. California residents are entitled to CCPA protections. Contact privacy@lumi.dev to exercise these rights.',
  },
  {
    title: 'Data Retention',
    content: 'We retain account data for the duration of your subscription plus 30 days. Usage logs are retained for 90 days. Billing records are retained as required by law. You can request immediate deletion of your data, subject to legal retention requirements.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy periodically. Material changes will be communicated via email and an in-app notification at least 30 days before taking effect. Continued use of the platform after changes constitutes acceptance of the updated policy.',
  },
];

export function PrivacyPage() {
  return (
    <div className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <h1 className={css('_fontbold')} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
          Last updated: March 1, 2026
        </p>

        <p style={{ lineHeight: 1.8, marginBottom: '2rem', color: 'var(--d-text)' }}>
          At Lumi, we take your privacy seriously. This policy describes how we collect,
          use, and protect your personal information when you use our platform and services.
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
          Questions about this policy? Contact us at{' '}
          <span style={{ color: 'var(--d-primary)' }}>privacy@lumi.dev</span>
        </p>
      </div>
    </div>
  );
}
