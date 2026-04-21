const TERMS_SECTIONS = [
  {
    title: 'Using The Hosted Service',
    body:
      'These Terms govern your use of the hosted Decantr registry, dashboard, and related online services. By using the hosted service, you agree to these Terms. If you do not agree, do not use the hosted service.',
  },
  {
    title: 'Accounts And Access',
    body:
      'You are responsible for activity that occurs through your account, organization workspace, API keys, and connected authentication providers. Keep credentials secure and do not bypass entitlement, moderation, or governance controls.',
  },
  {
    title: 'Your Content',
    body:
      'You retain ownership of content, packages, and metadata you submit to the hosted service. You grant Decantr the limited rights needed to host, process, display, secure, and deliver that content according to the visibility and sharing settings you choose.',
  },
  {
    title: 'Acceptable Use',
    body:
      'Do not use the hosted service to violate law, abuse infrastructure, evade moderation, compromise security, interfere with other users, or publish content you do not have the right to submit.',
  },
  {
    title: 'Billing And Plans',
    body:
      'Paid plans, organization collaboration, and hosted commercial features may be subject to separate pricing, billing events, and entitlement limits. Failure to pay may result in service restriction or downgrade according to the applicable plan rules.',
  },
  {
    title: 'Availability',
    body:
      'Decantr may change, improve, suspend, or remove hosted features as the product evolves. We aim for reliability, but the hosted service is provided on an as-available basis and may experience maintenance windows, outages, or operational changes.',
  },
  {
    title: 'Changes To These Terms',
    body:
      'Decantr may update these Terms over time. Material changes should appear on this page with an updated effective date before they take effect.',
  },
] as const;

export default function TermsPage() {
  return (
    <div className="registry-page-max registry-legal-shell">
      <section className="d-section" data-density="compact">
        <div className="registry-legal-hero">
          <span className="d-label registry-anchor-label">Terms</span>
          <h1 className="text-3xl font-semibold tracking-tight">Terms Of Service</h1>
          <p className="registry-legal-copy">
            Decantr keeps the source repositories MIT licensed while publishing separate terms for the hosted registry service.
          </p>
          <p className="registry-legal-updated">Effective date: April 21, 2026</p>
        </div>
      </section>

      <section className="d-section" data-density="compact">
        <div className="registry-legal-grid">
          <div className="d-surface registry-legal-card registry-legal-callout">
            <h2>Open Source Code Versus Hosted Service</h2>
            <p className="registry-legal-copy">
              Decantr source code distributed through its repositories remains available under the MIT License. These Terms apply to use of the hosted registry and related online services, and do not take away rights granted by separately distributed open-source licenses.
            </p>
          </div>

          {TERMS_SECTIONS.map((section) => (
            <div key={section.title} className="d-surface registry-legal-card">
              <h2>{section.title}</h2>
              <p className="registry-legal-copy">{section.body}</p>
            </div>
          ))}

          <div className="d-surface registry-legal-card">
            <h2>Practical Service Rules</h2>
            <ul className="registry-legal-list">
              <li>Respect package visibility, authorship, and organization governance settings.</li>
              <li>Do not share private registry material outside the scopes you control.</li>
              <li>Use the contact channels published on decantr.ai for service or legal questions.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
