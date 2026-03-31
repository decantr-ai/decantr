import { TopNavFooterShell } from '../shells/top-nav-footer';

function StubContent({ title }: { title: string }) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '5rem 2rem',
        textAlign: 'center' as const,
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--d-text)',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 16,
          color: 'var(--d-text-muted)',
          lineHeight: 1.6,
        }}
      >
        Coming soon. This page is under construction.
      </p>
    </div>
  );
}

export function AboutPage() {
  return (
    <TopNavFooterShell>
      <StubContent title="About" />
    </TopNavFooterShell>
  );
}

export function ContactPage() {
  return (
    <TopNavFooterShell>
      <StubContent title="Contact" />
    </TopNavFooterShell>
  );
}

export function PrivacyPage() {
  return (
    <TopNavFooterShell>
      <StubContent title="Privacy Policy" />
    </TopNavFooterShell>
  );
}

export function TermsPage() {
  return (
    <TopNavFooterShell>
      <StubContent title="Terms of Service" />
    </TopNavFooterShell>
  );
}

export function CookiesPage() {
  return (
    <TopNavFooterShell>
      <StubContent title="Cookie Policy" />
    </TopNavFooterShell>
  );
}
