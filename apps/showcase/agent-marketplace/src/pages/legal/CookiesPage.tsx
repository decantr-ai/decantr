import { css } from '@decantr/css';

export function CookiesPage() {
  return (
    <section className="section-gap-sm">
      <div className="container container-md">
        <h1 className={css('_heading1 _mb2')}>Cookie Policy</h1>
        <p className={css('_textsm _fgmuted _mb8')}>Last updated: April 1, 2026</p>

        <div className="prose">
          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help us recognize your browser, remember your preferences, and understand how you interact with AgentHub. We also use similar technologies such as local storage and session storage.
          </p>

          <h2>2. Types of Cookies We Use</h2>
          <p>
            AgentHub uses the following categories of cookies:
          </p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for authentication, security, and core platform functionality. These cannot be disabled.</li>
            <li><strong>Functional cookies:</strong> Remember your preferences such as dashboard layout, monitoring view settings, and notification choices.</li>
            <li><strong>Analytics cookies:</strong> Help us understand usage patterns, popular agents, and platform performance. This data is aggregated and anonymized.</li>
            <li><strong>Performance cookies:</strong> Monitor page load times, API response latency, and client-side rendering metrics to improve the platform experience.</li>
          </ul>

          <h2>3. Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. However, disabling essential cookies may prevent you from using core AgentHub features such as authentication and agent deployment.
          </p>
          <p>
            You can also manage your cookie preferences through your AgentHub account settings under Privacy preferences.
          </p>

          <h2>4. Third-Party Cookies</h2>
          <p>
            We use a limited number of third-party services that may set their own cookies:
          </p>
          <ul>
            <li><strong>Analytics providers:</strong> To measure platform usage and identify areas for improvement.</li>
            <li><strong>Error monitoring:</strong> To detect and resolve issues affecting your experience.</li>
            <li><strong>Payment processing:</strong> To securely handle billing and subscription management.</li>
          </ul>
          <p>
            We do not allow third-party advertising cookies on AgentHub.
          </p>

          <h2>5. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@agenthub.dev">privacy@agenthub.dev</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
