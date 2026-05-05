import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, GitCompareArrows, Scale, Network, Clock, Shield, Quote } from 'lucide-react';
import { features, testimonials } from '../data/mock';

const ICONS: Record<string, React.ElementType> = { Search, GitCompareArrows, Scale, Network, Clock, Shield };

export function HomePage() {
  return (
    <div className="counsel-page">
      {/* Hero */}
      <section className="d-section" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div className="counsel-seal" style={{ margin: '0 auto 1.5rem', width: 56, height: 56, fontSize: '1.25rem' }}>LR</div>
          <h1 className="counsel-header" style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1rem' }}>
            Legal Research,<br />Reimagined
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', fontFamily: 'Georgia, serif', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '36rem', margin: '0 auto 2rem' }}>
            Search case law, track citations, redline contracts, and manage matters — all in one authoritative workspace built for legal professionals.
          </p>
          <div className={css('_flex _jcc _gap3')}>
            <Link to="/register" className="d-interactive" data-variant="primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none' }}>
              Start Researching
            </Link>
            <Link to="/login" className="d-interactive" style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="d-section" style={{ padding: '4rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', marginBottom: '0.5rem', borderLeft: 'none' }}>Capabilities</p>
          <h2 className="counsel-header" style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '3rem' }}>
            Everything Your Firm Needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map((feature) => {
              const Icon = ICONS[feature.icon] || Search;
              return (
                <div key={feature.title} className="counsel-card" style={{ padding: '1.5rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <h3 className="counsel-header" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6, fontFamily: 'Georgia, serif' }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="d-section" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', marginBottom: '0.5rem', borderLeft: 'none' }}>Testimonials</p>
          <h2 className="counsel-header" style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '3rem' }}>
            Trusted by Leading Firms
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t) => (
              <div key={t.id} className="counsel-citation" style={{ padding: '1.5rem' }}>
                <Quote size={20} style={{ color: 'var(--d-primary)', marginBottom: '0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1rem', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', fontStyle: 'normal' }}>{t.author}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontStyle: 'normal' }}>{t.title}, {t.firm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="d-section" style={{ padding: '4rem 1.5rem', background: 'var(--d-primary)', textAlign: 'center' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', color: '#FAF7F2', fontFamily: 'Georgia, serif', fontWeight: 700, marginBottom: '0.75rem' }}>
            Ready to Shepardize?
          </h2>
          <p style={{ color: 'rgba(250, 247, 242, 0.8)', fontFamily: 'Georgia, serif', marginBottom: '1.5rem' }}>
            Join thousands of attorneys who research smarter, not harder.
          </p>
          <Link
            to="/register"
            className="d-interactive"
            style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none', background: '#FAF7F2', color: 'var(--d-primary)', borderColor: '#FAF7F2' }}
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
