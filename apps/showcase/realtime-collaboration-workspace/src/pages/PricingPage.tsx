import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const tiers = [
  { name: 'Free', price: '$0', period: 'forever', desc: 'Small teams just getting started', features: ['Up to 5 members', '10 documents', 'Basic comments', '7-day version history'], cta: 'Start free' },
  { name: 'Team', price: '$12', period: 'per user/month', desc: 'For teams that collaborate daily', features: ['Unlimited members', 'Unlimited documents', 'Inline comments & mentions', '90-day version history', 'Slack & Linear integrations', 'Guest access'], cta: 'Create workspace', featured: true },
  { name: 'Enterprise', price: 'Custom', period: 'contact us', desc: 'For large organizations with custom needs', features: ['Everything in Team', 'SSO & SCIM', 'Audit logs', 'Custom retention', 'Dedicated support', 'SLA'], cta: 'Talk to sales' },
];

export function PricingPage() {
  return (
    <div className="entrance-fade">
      <section style={{ padding: '5rem 1.5rem 2rem', textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Pricing that scales with your team.
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          Start free, upgrade when you need more. No surprises.
        </p>
      </section>

      <section style={{ padding: '2rem 1.5rem 4rem', maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {tiers.map(t => (
            <div key={t.name} className="paper-card" style={{ padding: '2rem 1.5rem', borderColor: t.featured ? 'var(--d-primary)' : undefined, borderWidth: t.featured ? 2 : 1, position: 'relative' }}>
              {t.featured && (
                <div style={{ position: 'absolute', top: '-0.75rem', left: '1.5rem', background: 'var(--d-primary)', color: '#fff', fontSize: '0.6875rem', padding: '0.25rem 0.625rem', borderRadius: 'var(--d-radius-sm)', fontWeight: 600 }}>
                  Most popular
                </div>
              )}
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 600 }}>{t.price}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{t.period}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem', minHeight: '2.75rem' }}>{t.desc}</p>
              <Link
                to="/register"
                className="d-interactive"
                style={{
                  width: '100%', justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem',
                  textDecoration: 'none',
                  background: t.featured ? 'var(--d-primary)' : 'transparent',
                  color: t.featured ? '#fff' : 'var(--d-text)',
                  borderColor: t.featured ? 'var(--d-primary)' : 'var(--d-border)',
                  marginBottom: '1.25rem',
                }}
              >
                {t.cta}
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--d-text)' }}>
                    <Check size={15} style={{ color: 'var(--d-primary)', marginTop: '0.1875rem', flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Questions about pricing?</h2>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>We\'re happy to chat. No pressure, no pitch.</p>
        <Link to="/contact" className="d-interactive" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>Contact us</Link>
      </section>
    </div>
  );
}
