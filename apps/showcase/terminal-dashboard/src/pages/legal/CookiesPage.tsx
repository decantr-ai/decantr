import { PublicShell } from '@/components/PublicShell';

const SECTIONS = [
  { id: 'what-are-cookies', title: 'What Are Cookies' },
  { id: 'types', title: 'Types We Use' },
  { id: 'managing', title: 'Managing Cookies' },
  { id: 'third-party', title: 'Third-Party' },
  { id: 'updates', title: 'Updates' },
] as const;

const tocStyle: React.CSSProperties = {
  position: 'sticky',
  top: 120,
  alignSelf: 'flex-start',
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  fontSize: '0.75rem',
  flexShrink: 0,
};

const tocLinkStyle: React.CSSProperties = {
  color: 'var(--d-text-muted)',
  textDecoration: 'none',
  padding: '0.25rem 0',
  borderLeft: '1px solid var(--d-border)',
  paddingLeft: '0.75rem',
  transition: 'color 0.15s',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--d-primary)',
  margin: '0 0 0.75rem 0',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--d-text-muted)',
  lineHeight: 1.7,
  margin: '0 0 1rem 0',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.75rem',
  margin: '0 0 1rem 0',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem',
  borderBottom: '1px solid var(--d-border)',
  color: 'var(--d-primary)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontSize: '0.6875rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderBottom: '1px solid var(--d-border)',
  color: 'var(--d-text-muted)',
  verticalAlign: 'top',
};

export function CookiesPage() {
  return (
    <PublicShell>
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '2rem 1.5rem',
          display: 'flex',
          gap: '3rem',
        }}
      >
        <nav style={tocStyle} className="legal-toc">
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              color: 'var(--d-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.25rem',
            }}
          >
            Contents
          </span>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} style={tocLinkStyle}>
              {s.title}
            </a>
          ))}
        </nav>

        <article
          className="term-panel"
          style={{
            flex: 1,
            padding: '2rem',
            minWidth: 0,
          }}
        >
          <h1
            className="term-glow"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--d-primary)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.1em',
            }}
          >
            COOKIE POLICY
          </h1>
          <p
            className="d-annotation"
            data-status="info"
            style={{
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              margin: '0 0 2rem 0',
            }}
          >
            Last updated: April 3, 2026
          </p>

          <p style={paragraphStyle}>
            This Cookie Policy explains how Terminal Dashboard, Inc. ("we",
            "us", or "our") uses cookies and similar tracking technologies when
            you visit or interact with our Service. It should be read alongside
            our Privacy Policy, which provides further detail on how we handle
            your personal information.
          </p>

          <section id="what-are-cookies" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>What Are Cookies</h2>
            <p style={paragraphStyle}>
              Cookies are small text files that are stored on your device when
              you visit a website. They are widely used to make websites work
              more efficiently, provide usage information to site operators, and
              enable certain features that improve user experience.
            </p>
            <p style={paragraphStyle}>
              Cookies may be "session" cookies (deleted when you close your
              browser) or "persistent" cookies (remaining on your device for a
              set period or until you manually delete them). They can be set by
              the website you are visiting ("first-party cookies") or by third
              parties that provide services to that website ("third-party
              cookies").
            </p>
            <p style={paragraphStyle}>
              In addition to cookies, we may use similar technologies such as
              local storage, session storage, and pixel tags to collect and
              store information about your interactions with our Service.
            </p>
          </section>

          <section id="types" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Types We Use</h2>
            <p style={paragraphStyle}>
              We categorize the cookies used on our Service into the following
              groups:
            </p>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Purpose</th>
                  <th style={thStyle}>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>
                    <span style={{ color: 'var(--d-primary)' }}>Essential</span>
                  </td>
                  <td style={tdStyle}>
                    Required for authentication, session management, and
                    security. The Service cannot function without these.
                  </td>
                  <td style={tdStyle}>Session</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <span style={{ color: 'var(--d-primary)' }}>Functional</span>
                  </td>
                  <td style={tdStyle}>
                    Remember your preferences such as theme settings, dashboard
                    layout, and language selection.
                  </td>
                  <td style={tdStyle}>1 year</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <span style={{ color: 'var(--d-primary)' }}>Analytics</span>
                  </td>
                  <td style={tdStyle}>
                    Help us understand how users interact with the Service,
                    which pages are visited most frequently, and where errors
                    occur. Data is aggregated and anonymized.
                  </td>
                  <td style={tdStyle}>90 days</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <span style={{ color: 'var(--d-primary)' }}>Performance</span>
                  </td>
                  <td style={tdStyle}>
                    Monitor page load times, API response latencies, and
                    rendering performance to help us optimize the Service.
                  </td>
                  <td style={tdStyle}>30 days</td>
                </tr>
              </tbody>
            </table>

            <p style={paragraphStyle}>
              We do not use advertising or marketing cookies. No data collected
              through our cookies is shared with advertising networks or data
              brokers.
            </p>
          </section>

          <section id="managing" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Managing Cookies</h2>
            <p style={paragraphStyle}>
              Most web browsers allow you to control cookies through their
              settings. You can typically configure your browser to block all
              cookies, block third-party cookies, or alert you when a cookie is
              being set. Consult your browser's help documentation for specific
              instructions.
            </p>
            <p style={paragraphStyle}>
              Please note that disabling essential cookies will prevent you
              from using core features of the Service, including
              authentication and session management. Disabling functional
              cookies may cause certain preferences to reset between sessions.
            </p>
            <p style={paragraphStyle}>
              You can clear all cookies stored by the Service at any time using
              your browser's "Clear browsing data" feature. On your next visit,
              essential cookies will be recreated as needed.
            </p>
          </section>

          <section id="third-party" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Third-Party</h2>
            <p style={paragraphStyle}>
              We use a limited number of third-party services that may set
              their own cookies when you interact with the Service:
            </p>
            <div
              style={{
                padding: '1rem',
                border: '1px solid var(--d-border)',
                background: 'var(--d-bg)',
                fontSize: '0.8125rem',
                color: 'var(--d-text-muted)',
                lineHeight: 1.8,
                marginBottom: '1rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--d-accent)' }}>Hosting Provider</span>
                {' '}&mdash; Infrastructure cookies for load balancing and DDoS
                protection. These are strictly necessary and session-scoped.
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--d-accent)' }}>Error Tracking</span>
                {' '}&mdash; Captures JavaScript errors and performance metrics to
                help us diagnose and fix issues. Data is retained for 90 days.
              </div>
            </div>
            <p style={paragraphStyle}>
              We carefully vet all third-party services and require them to
              comply with our data processing agreements. We do not permit
              third parties to use cookies set through our Service for their
              own independent purposes.
            </p>
          </section>

          <section id="updates">
            <h2 style={sectionHeadingStyle}>Updates</h2>
            <p style={paragraphStyle}>
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or for legal, operational, or regulatory
              reasons. The "Last updated" date at the top of this page
              indicates when the most recent revision was published.
            </p>
            <p style={paragraphStyle}>
              We encourage you to review this policy periodically to stay
              informed about how we use cookies. If we make material changes,
              we will provide a prominent notice on the Service or send you a
              direct notification.
            </p>
            <p style={paragraphStyle}>
              If you have questions about our use of cookies, contact us at{' '}
              <span style={{ color: 'var(--d-accent)' }}>privacy@terminal.dev</span>.
            </p>
          </section>
        </article>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .legal-toc { display: none !important; }
        }
      `}</style>
    </PublicShell>
  );
}
