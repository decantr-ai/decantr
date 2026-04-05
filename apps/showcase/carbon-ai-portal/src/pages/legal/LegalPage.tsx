interface Section {
  id: string;
  title: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  sections: Section[];
}

export function LegalPage({ title, updated, sections }: LegalPageProps) {
  return (
    <div style={{ padding: '3rem 1.5rem 5rem' }}>
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 220px',
          gap: '3rem',
        }}
      >
        <article>
          <header style={{ marginBottom: '2rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Legal</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>{title}</h1>
            <p className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              Last updated: {updated}
            </p>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {sections.map((s) => (
              <section key={s.id} id={s.id} style={{ scrollMarginTop: '4rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.875rem' }}>{s.title}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--d-text-muted)' }}>
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
        <aside style={{ position: 'sticky', top: '5rem', alignSelf: 'start', display: 'none' }} className="legal-toc">
          <p className="d-label" style={{ marginBottom: '0.875rem' }}>On this page</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--d-text-muted)',
                  textDecoration: 'none',
                  padding: '0.25rem 0',
                  lineHeight: 1.4,
                  transition: 'color 0.12s ease',
                }}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
      </div>
      <style>{`@media (min-width: 1024px) { .legal-toc { display: block !important; } } html { scroll-behavior: smooth; }`}</style>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="March 14, 2026"
      sections={[
        {
          id: 'overview',
          title: '1. Overview',
          body: [
            'Carbon respects your privacy. This policy explains what we collect, why we collect it, and how we protect it.',
            'We collect the minimum necessary data to provide the service and never sell user data to third parties.',
          ],
        },
        {
          id: 'data-we-collect',
          title: '2. Data we collect',
          body: [
            'Account information (name, email) provided when you register.',
            'Conversation content, stored encrypted at rest and only accessible by you.',
            'Usage metadata (login times, device type) used for security and reliability.',
          ],
        },
        {
          id: 'training',
          title: '3. Model training',
          body: [
            'We do not use your conversations to train AI models. Ever.',
          ],
        },
        {
          id: 'security',
          title: '4. Security',
          body: [
            'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain SOC 2 Type II certification.',
          ],
        },
        {
          id: 'rights',
          title: '5. Your rights',
          body: [
            'You can export or delete your data at any time from Settings. Account deletion is permanent within 30 days.',
          ],
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="March 14, 2026"
      sections={[
        {
          id: 'acceptance',
          title: '1. Acceptance',
          body: ['By using Carbon, you agree to these terms. If you do not agree, do not use the service.'],
        },
        {
          id: 'accounts',
          title: '2. Your account',
          body: ['You are responsible for maintaining the confidentiality of your credentials and all activity under your account.'],
        },
        {
          id: 'use',
          title: '3. Acceptable use',
          body: [
            'Do not use Carbon to generate content that is illegal, harmful, or violates others\' rights. We reserve the right to suspend accounts that violate these terms.',
          ],
        },
        {
          id: 'billing',
          title: '4. Billing',
          body: ['Paid plans renew automatically. You can cancel anytime from Settings. Refunds are handled case-by-case.'],
        },
        {
          id: 'liability',
          title: '5. Limitation of liability',
          body: ['Carbon is provided as-is. We are not liable for indirect or consequential damages beyond the fees you paid in the last twelve months.'],
        },
      ]}
    />
  );
}

export function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="March 14, 2026"
      sections={[
        {
          id: 'what',
          title: '1. What are cookies?',
          body: ['Small text files stored on your device that remember your preferences and keep you signed in.'],
        },
        {
          id: 'types',
          title: '2. Types we use',
          body: [
            'Essential cookies for authentication and security.',
            'Preference cookies that remember your theme and language.',
            'Analytics cookies (anonymized) to understand how the product is used.',
          ],
        },
        {
          id: 'managing',
          title: '3. Managing cookies',
          body: ['You can disable non-essential cookies in your browser settings or through our preferences page.'],
        },
      ]}
    />
  );
}
