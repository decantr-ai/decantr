const PRIVACY_SECTIONS = [
  {
    title: 'Scope',
    body:
      'This Privacy Policy explains how Decantr handles information collected through the hosted registry and related Decantr services. It governs the service relationship for hosted use and does not change the MIT license terms that apply to Decantr source code distributed separately.',
  },
  {
    title: 'Information We Collect',
    body:
      'When you use the hosted registry, Decantr may process account details such as your email address, profile metadata, authentication provider identity, organization membership, billing state, and content or package metadata you choose to publish or manage through the service.',
  },
  {
    title: 'Operational Data',
    body:
      'We may collect operational and security data such as request logs, rate-limit events, moderation actions, audit history, and basic usage diagnostics needed to run, secure, and improve the hosted service.',
  },
  {
    title: 'How We Use Data',
    body:
      'Decantr uses service data to authenticate users, render dashboard and registry experiences, enforce plan entitlements, power collaboration and governance workflows, prevent abuse, investigate incidents, and improve product reliability.',
  },
  {
    title: 'Sharing',
    body:
      'We do not treat your account or organization data as public by default. Publicly published registry content and profile information may be visible to other users, while private packages and organization-only workflows are handled according to their configured visibility and entitlement model.',
  },
  {
    title: 'Retention',
    body:
      'We retain service data for as long as necessary to operate the hosted product, meet security and compliance needs, preserve audit history, and resolve billing or support issues. Different data classes may have different retention windows based on operational need.',
  },
  {
    title: 'Changes',
    body:
      'Decantr may update this Privacy Policy as the hosted product evolves. Material changes should be reflected on this page with an updated effective date before they take effect.',
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="registry-page-max registry-legal-shell">
      <section className="d-section" data-density="compact">
        <div className="registry-legal-hero">
          <span className="d-label registry-anchor-label">Privacy</span>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="registry-legal-copy">
            Decantr keeps the source repositories MIT licensed while also publishing a service-level privacy policy for the hosted registry experience.
          </p>
          <p className="registry-legal-updated">Effective date: April 21, 2026</p>
        </div>
      </section>

      <section className="d-section" data-density="compact">
        <div className="registry-legal-grid">
          <div className="d-surface registry-legal-card registry-legal-callout">
            <h2>Open Source And Hosted Service Boundary</h2>
            <p className="registry-legal-copy">
              The Decantr source repositories are available under the MIT License. This policy applies to the hosted registry service, not to your rights under the open-source license for code we distribute separately.
            </p>
          </div>

          {PRIVACY_SECTIONS.map((section) => (
            <div key={section.title} className="d-surface registry-legal-card">
              <h2>{section.title}</h2>
              <p className="registry-legal-copy">{section.body}</p>
            </div>
          ))}

          <div className="d-surface registry-legal-card">
            <h2>Your Choices</h2>
            <ul className="registry-legal-list">
              <li>Use public or private visibility controls when publishing content.</li>
              <li>Review organization membership and governance settings before sharing collaborative content.</li>
              <li>Use the contact channels published on decantr.ai for service privacy questions or requests.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
