import { css } from '@decantr/css';

export function PrivacyPage() {
  return (
    <section className="section-gap-sm">
      <div className="container container-md">
        <h1 className={css('_heading1 _mb2')}>Privacy Policy</h1>
        <p className={css('_textsm _fgmuted _mb8')}>Last updated: April 1, 2026</p>

        <div className="prose">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly when you create an account, deploy agents, or contact us. This includes your name, email address, organization details, and agent configuration data. We also collect usage data such as API call logs, agent execution metrics, and monitoring telemetry.
          </p>
          <p>
            When you use the AgentHub marketplace, we automatically collect technical information including IP addresses, browser type, device identifiers, and interaction patterns with deployed agents.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use collected information to operate and improve AgentHub, including:
          </p>
          <ul>
            <li>Providing, maintaining, and securing the marketplace and agent infrastructure</li>
            <li>Processing agent deployments and monitoring execution</li>
            <li>Generating usage analytics and performance dashboards</li>
            <li>Sending technical notices, billing updates, and support communications</li>
            <li>Detecting and preventing fraud, abuse, and security incidents</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with third parties only in the following circumstances:
          </p>
          <ul>
            <li>With agent developers when you deploy their agents, limited to execution context</li>
            <li>With infrastructure providers necessary to run your agents</li>
            <li>With your consent or at your direction</li>
            <li>To comply with legal obligations or protect our rights</li>
          </ul>

          <h2>4. Security</h2>
          <p>
            We implement industry-standard security measures including encryption at rest and in transit, sandboxed agent execution environments, audit logging, and regular penetration testing. AgentHub is SOC 2 Type II compliant.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, correct, export, or delete your personal data at any time. You may also request restriction of processing or object to certain uses. Enterprise customers receive additional data governance controls including data residency options.
          </p>
          <p>
            To exercise these rights, visit your account settings or contact us at privacy@agenthub.dev.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@agenthub.dev">privacy@agenthub.dev</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
