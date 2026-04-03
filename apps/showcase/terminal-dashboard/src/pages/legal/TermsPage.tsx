import { PublicShell } from '@/components/PublicShell';

const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance' },
  { id: 'license', title: 'License' },
  { id: 'usage', title: 'Usage' },
  { id: 'restrictions', title: 'Restrictions' },
  { id: 'termination', title: 'Termination' },
  { id: 'liability', title: 'Liability' },
  { id: 'governing-law', title: 'Governing Law' },
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

export function TermsPage() {
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
            TERMS OF SERVICE
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
            These Terms of Service ("Terms") govern your access to and use of
            the Terminal Dashboard platform, including all associated services,
            APIs, and tools (the "Service") operated by Terminal Dashboard, Inc.
            ("Company"). By accessing or using the Service, you agree to be
            bound by these Terms.
          </p>

          <section id="acceptance" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Acceptance</h2>
            <p style={paragraphStyle}>
              By creating an account or using the Service, you confirm that you
              are at least 18 years of age and have the legal capacity to enter
              into a binding agreement. If you are using the Service on behalf
              of an organization, you represent that you have the authority to
              bind that organization to these Terms.
            </p>
            <p style={paragraphStyle}>
              We reserve the right to update these Terms at any time. Material
              changes will be communicated via email or in-app notification at
              least 30 days before taking effect. Your continued use of the
              Service after such notice constitutes acceptance of the revised
              Terms.
            </p>
          </section>

          <section id="license" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>License</h2>
            <p style={paragraphStyle}>
              Subject to your compliance with these Terms, we grant you a
              limited, non-exclusive, non-transferable, revocable license to
              access and use the Service for your internal business or personal
              purposes. This license does not include the right to sublicense,
              resell, or redistribute the Service.
            </p>
            <p style={paragraphStyle}>
              All intellectual property rights in the Service, including
              software, documentation, visual design, and trademarks, remain
              the exclusive property of Terminal Dashboard, Inc. Nothing in
              these Terms transfers any ownership rights to you.
            </p>
          </section>

          <section id="usage" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Usage</h2>
            <p style={paragraphStyle}>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You agree to notify us immediately of any unauthorized
              use or security breach.
            </p>
            <p style={paragraphStyle}>
              You may use the Service to monitor metrics, view logs, manage
              configurations, and access related dashboard functionality as
              described in our documentation. API usage is subject to rate
              limits published in our developer documentation.
            </p>
            <p style={paragraphStyle}>
              You retain ownership of all data you submit to the Service. By
              uploading data, you grant us a limited license to process, store,
              and display it solely for the purpose of providing the Service to
              you.
            </p>
          </section>

          <section id="restrictions" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Restrictions</h2>
            <p style={paragraphStyle}>
              You agree not to: (a) reverse engineer, decompile, or
              disassemble any portion of the Service; (b) use automated tools
              to scrape, crawl, or extract data from the Service beyond the
              scope of our published APIs; (c) interfere with or disrupt the
              integrity or performance of the Service; (d) attempt to gain
              unauthorized access to any systems or networks connected to the
              Service.
            </p>
            <p style={paragraphStyle}>
              You may not use the Service for any unlawful purpose, to transmit
              malicious code, to impersonate any person or entity, or to
              violate any applicable export control or sanctions regulations.
              Violation of these restrictions may result in immediate account
              termination.
            </p>
          </section>

          <section id="termination" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Termination</h2>
            <p style={paragraphStyle}>
              You may terminate your account at any time by contacting support
              or using the account deletion feature in your settings. Upon
              termination, your right to use the Service ceases immediately.
            </p>
            <p style={paragraphStyle}>
              We may suspend or terminate your access if we reasonably believe
              you have violated these Terms, if required by law, or if we
              discontinue the Service. Where feasible, we will provide advance
              notice and an opportunity to export your data before termination.
            </p>
            <p style={paragraphStyle}>
              Sections relating to intellectual property, limitation of
              liability, indemnification, and governing law will survive
              termination of these Terms.
            </p>
          </section>

          <section id="liability" style={{ marginBottom: '2rem' }}>
            <h2 style={sectionHeadingStyle}>Liability</h2>
            <p style={paragraphStyle}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT
              THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
            <p style={paragraphStyle}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TERMINAL DASHBOARD, INC.
              SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO
              YOUR USE OF THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY.
            </p>
            <p style={paragraphStyle}>
              Our total aggregate liability for all claims arising out of or
              related to these Terms or the Service shall not exceed the
              greater of (a) the amount you paid us in the 12 months preceding
              the claim, or (b) one hundred US dollars ($100).
            </p>
          </section>

          <section id="governing-law">
            <h2 style={sectionHeadingStyle}>Governing Law</h2>
            <p style={paragraphStyle}>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, without regard to conflict
              of law principles. Any dispute arising under these Terms shall be
              resolved exclusively in the state or federal courts located in
              San Francisco County, California.
            </p>
            <p style={paragraphStyle}>
              If any provision of these Terms is held to be invalid or
              unenforceable, the remaining provisions shall continue in full
              force and effect. Our failure to enforce any right or provision
              shall not constitute a waiver of that right or provision.
            </p>
            <p style={paragraphStyle}>
              These Terms constitute the entire agreement between you and
              Terminal Dashboard, Inc. regarding the Service, superseding any
              prior agreements or communications.
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
