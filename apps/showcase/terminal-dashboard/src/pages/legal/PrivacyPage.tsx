import { PublicShell } from '@/components/PublicShell';

const SECTIONS = [
  { id: 'collect', title: 'Information We Collect' },
  { id: 'use', title: 'How We Use It' },
  { id: 'sharing', title: 'Data Sharing' },
  { id: 'security', title: 'Security' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'contact', title: 'Contact' },
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

export function PrivacyPage() {
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
            PRIVACY POLICY
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
            Terminal Dashboard ("we", "us", or "our") is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our platform,
            including the Terminal Dashboard web application, API services, and
            related tools (collectively, the "Service").
          </p>

          <section id="collect" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Information We Collect</h2>
            <p style={paragraphStyle}>
              We collect information you provide directly when creating an
              account, including your email address, username, and hashed
              password. We do not store plaintext credentials at any point in
              our processing pipeline.
            </p>
            <p style={paragraphStyle}>
              When you use the Service, we automatically collect usage data such
              as IP addresses, browser type, operating system, referral URLs,
              pages visited, and timestamps of interactions. This data is
              collected through server-side logging and does not rely on
              third-party tracking scripts.
            </p>
            <p style={paragraphStyle}>
              If you connect third-party integrations (such as GitHub or CI/CD
              pipelines), we may receive metadata about your repositories,
              deployment status, and build logs. We access only the minimum
              scopes required to provide the requested functionality.
            </p>
          </section>

          <section id="use" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>How We Use It</h2>
            <p style={paragraphStyle}>
              We use your information to operate, maintain, and improve the
              Service. This includes authenticating your identity, processing
              your requests, rendering dashboard visualizations, and providing
              technical support when issues arise.
            </p>
            <p style={paragraphStyle}>
              Usage analytics are aggregated and anonymized to identify
              performance bottlenecks, understand feature adoption, and plan
              infrastructure capacity. We do not build advertising profiles or
              sell behavioral data to any third party.
            </p>
            <p style={paragraphStyle}>
              We may use your email address to send transactional
              notifications, security alerts, and service updates. You can opt
              out of non-essential communications at any time through your
              account settings.
            </p>
          </section>

          <section id="sharing" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Data Sharing</h2>
            <p style={paragraphStyle}>
              We do not sell, rent, or trade your personal information. We may
              share data with trusted service providers who assist in operating
              the Service (such as cloud hosting providers, email delivery
              services, and payment processors), subject to contractual
              obligations that restrict their use of your data.
            </p>
            <p style={paragraphStyle}>
              We may disclose information if required by law, regulation, legal
              process, or governmental request. We will attempt to notify you
              before disclosure unless prohibited by law or court order.
            </p>
            <p style={paragraphStyle}>
              In the event of a merger, acquisition, or asset sale, your
              information may be transferred as part of the transaction. We
              will provide notice before your data becomes subject to a
              different privacy policy.
            </p>
          </section>

          <section id="security" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Security</h2>
            <p style={paragraphStyle}>
              We implement industry-standard security measures including
              TLS 1.3 encryption in transit, AES-256 encryption at rest,
              role-based access controls, and regular security audits. All
              authentication tokens are short-lived and rotated automatically.
            </p>
            <p style={paragraphStyle}>
              Our infrastructure runs on isolated compute instances with
              network-level segmentation. Database backups are encrypted and
              stored in geographically separate regions. We conduct penetration
              testing on a quarterly basis.
            </p>
            <p style={paragraphStyle}>
              Despite these measures, no method of electronic storage or
              transmission is completely secure. We cannot guarantee absolute
              security but will promptly notify affected users in the event of
              a data breach, in accordance with applicable laws.
            </p>
          </section>

          <section id="rights" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Your Rights</h2>
            <p style={paragraphStyle}>
              Depending on your jurisdiction, you may have the right to access,
              correct, delete, or export your personal data. You may also have
              the right to restrict or object to certain processing activities.
            </p>
            <p style={paragraphStyle}>
              To exercise these rights, contact us at the address below or use
              the data management tools in your account settings. We will
              respond to valid requests within 30 days. Identity verification
              may be required before processing your request.
            </p>
            <p style={paragraphStyle}>
              If you are located in the European Economic Area, you have
              additional rights under the General Data Protection Regulation
              (GDPR), including the right to lodge a complaint with a
              supervisory authority. If you are a California resident, you have
              rights under the California Consumer Privacy Act (CCPA).
            </p>
          </section>

          <section id="contact">
            <h2 style={sectionHeadingStyle}>Contact</h2>
            <p style={paragraphStyle}>
              If you have questions or concerns about this Privacy Policy or
              our data practices, contact us at:
            </p>
            <div
              style={{
                padding: '1rem',
                border: '1px solid var(--d-border)',
                background: 'var(--d-bg)',
                fontSize: '0.8125rem',
                color: 'var(--d-text)',
                lineHeight: 1.8,
                fontFamily: 'inherit',
              }}
            >
              <div>Terminal Dashboard, Inc.</div>
              <div>Privacy Team</div>
              <div style={{ color: 'var(--d-accent)' }}>privacy@terminal.dev</div>
              <div>1 Terminal Way, San Francisco, CA 94105</div>
            </div>
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
