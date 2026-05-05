import { Link, useNavigate } from 'react-router-dom';
import {
  Layers, BarChart3, BookOpen, Vote, Banknote, Shield,
  ArrowRight, Hexagon, Check,
} from 'lucide-react';
import { marketingFeatures, marketingStats, testimonials, pricingTiers } from '@/data/mock';
import { useAuth } from '@/hooks/useAuth';

const iconMap: Record<string, React.ElementType> = {
  layers: Layers,
  'bar-chart-3': BarChart3,
  'book-open': BookOpen,
  vote: Vote,
  banknote: Banknote,
  shield: Shield,
};

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cta = () => navigate(isAuthenticated ? '/dashboard' : '/register');

  return (
    <div>
      {/* Top nav */}
      <nav className="fo-nav">
        <Link to="/" style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text)', textDecoration: 'none' }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 'var(--d-radius)',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Hexagon size={14} color="#fff" />
          </div>
          Fractionel
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Sign in</Link>
          <button className="fo-button-primary" onClick={cta} style={{ padding: '0.375rem 0.875rem', fontSize: '0.875rem' }}>
            Get started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="fo-hero">
        <div className="fo-orb fo-orb-1" />
        <div className="fo-orb fo-orb-2" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
          <div className="d-annotation" data-status="info" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            Now open: Nordic Wind Portfolio
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Own fractions of <span className="fo-gradient-text">premium assets</span>
          </h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--d-text-muted)', maxWidth: 640, margin: '0 auto 2rem' }}>
            Real estate, private equity, art, and infrastructure — fractionalized into tradeable shares with institutional-grade cap tables, governance, and dividend tracking.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="fo-button-primary" onClick={cta} style={{ padding: '0.625rem 1.5rem', fontSize: '0.9rem' }}>
              Start investing <ArrowRight size={16} />
            </button>
            <a href="#features" className="d-interactive" data-variant="ghost" style={{ padding: '0.625rem 1.5rem', fontSize: '0.9rem' }}>
              See features
            </a>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Institutional-grade fractional ownership
            </h2>
            <p style={{ color: 'var(--d-text-muted)', maxWidth: 560, margin: '0 auto' }}>
              From cap table management to secondary market trading — everything you need to own, govern, and trade fractional positions.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {marketingFeatures.map(f => {
              const Icon = iconMap[f.icon] || Layers;
              return (
                <div key={f.title} className="fo-card" style={{ padding: 'var(--d-surface-p)' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--d-radius)',
                    background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.875rem',
                  }}>
                    <Icon size={20} style={{ color: 'var(--d-primary-hover)' }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '4rem 2rem', borderTop: '1px solid var(--d-border)', borderBottom: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {marketingStats.map(s => (
              <div key={s.label}>
                <div className="fo-gradient-text fo-mono" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
                  {s.value}
                </div>
                <div className="d-label" style={{ marginTop: '0.375rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Transparent pricing</h2>
            <p style={{ color: 'var(--d-text-muted)' }}>Start free. Scale with your portfolio.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--d-content-gap)', alignItems: 'stretch' }}>
            {pricingTiers.map(tier => (
              <div
                key={tier.name}
                className="d-surface"
                style={{
                  padding: 'var(--d-surface-p)',
                  borderTop: tier.recommended ? '3px solid var(--d-primary)' : undefined,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {tier.recommended && (
                  <span className="d-annotation" data-status="info" style={{ position: 'absolute', top: -10, right: 16 }}>
                    Popular
                  </span>
                )}
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{tier.name}</h3>
                <div style={{ marginBottom: '1rem' }}>
                  {tier.price > 0 ? (
                    <>
                      <span className="fo-mono" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                        ${tier.price.toFixed(0)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}> {tier.period}</span>
                    </>
                  ) : (
                    <span className="fo-mono" style={{ fontSize: '1.875rem', fontWeight: 700 }}>Free</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, marginBottom: '1rem' }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <Check size={13} style={{ color: 'var(--d-success)', flexShrink: 0, marginTop: 3 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={cta}
                  className={tier.recommended ? 'fo-button-primary' : 'd-interactive'}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
                >
                  {tier.current ? 'Current plan' : tier.name === 'Institutional' ? 'Contact sales' : 'Get started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: '5rem 2rem', borderTop: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '2.5rem' }}>
            Trusted by serious investors
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map(t => (
              <div key={t.author} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div className="fo-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.author}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Start owning premium assets today
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Browse available assets and make your first investment in minutes. Accredited investor verification takes under 24 hours.
          </p>
          <button className="fo-button-primary" onClick={cta} style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}>
            Get started free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {[
              { heading: 'Platform', links: ['Assets', 'Order Book', 'Governance', 'Dividends'] },
              { heading: 'Company', links: ['About', 'Security', 'Careers', 'Contact'] },
              { heading: 'Resources', links: ['Help Center', 'Docs', 'API', 'Status'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'Disclosures', 'SEC Filings'] },
            ].map(col => (
              <div key={col.heading}>
                <div className="d-label" style={{ marginBottom: '0.75rem' }}>{col.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>2026 Fractionel Inc. SEC-registered offering. Not investment advice.</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Twitter', 'LinkedIn', 'Discord'].map(s => (
                <a key={s} href="#" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
