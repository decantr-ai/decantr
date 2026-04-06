import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Vote, DollarSign, Video, Wrench, Accessibility, Database, ArrowRight, Quote } from 'lucide-react';
import { platformFeatures, communityQuotes } from '@/data/mock';

const iconMap = { Vote, DollarSign, Video, Wrench, Accessibility, Database } as Record<string, typeof Vote>;

export function MarketingHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="d-section" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="d-label" style={{ textAlign: 'center', letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--d-primary)' }}>
            CIVIC ENGAGEMENT
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.25rem', color: 'var(--d-text)' }}>
            Your City. Your Voice.{' '}
            <span style={{ color: 'var(--d-primary)' }}>Your Platform.</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Track budgets, sign petitions, attend meetings, and request services.
            Built for every citizen with WCAG AAA accessibility.
          </p>
          <div className={css('_flex _jcc _gap3 _wrap')}>
            <Link
              to="/register"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.625rem 1.5rem', fontSize: '1rem', textDecoration: 'none' }}
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/about"
              className="d-interactive"
              style={{ padding: '0.625rem 1.5rem', fontSize: '1rem', textDecoration: 'none' }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="d-section" style={{ padding: '4rem 1.5rem', background: 'var(--d-surface-raised)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="d-label" style={{ textAlign: 'center', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--d-primary)' }}>
            CAPABILITIES
          </div>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            Everything for Civic Participation
          </h2>
          <div className={css('_grid _gc1')} style={{ gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {platformFeatures.map((feat, i) => {
              const Icon = iconMap[feat.icon] || Vote;
              return (
                <div
                  key={feat.title}
                  className="d-surface gov-card"
                  style={{
                    padding: '1.5rem',
                    opacity: 0,
                    animation: `decantr-entrance 0.4s ease forwards`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
                    borderRadius: 2, marginBottom: '0.75rem',
                  }}>
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} aria-hidden />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Quotes */}
      <section className="d-section" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="d-label" style={{ textAlign: 'center', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--d-primary)' }}>
            COMMUNITY VOICES
          </div>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            What Residents Are Saying
          </h2>
          <div className={css('_grid _gc1')} style={{ gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {communityQuotes.map((q, i) => (
              <div
                key={q.id}
                className="d-surface gov-card"
                style={{
                  padding: '1.5rem',
                  opacity: 0,
                  animation: `decantr-entrance 0.4s ease forwards`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <Quote size={20} style={{ color: 'var(--d-primary)', marginBottom: '0.75rem' }} aria-hidden />
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1rem', fontStyle: 'italic' }}>
                  &ldquo;{q.text}&rdquo;
                </p>
                <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{q.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="d-section" style={{
        padding: '4rem 1.5rem',
        background: 'var(--d-primary)',
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Ready to Make Your Voice Heard?
          </h2>
          <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9, lineHeight: 1.7 }}>
            Join thousands of residents who are actively shaping their community.
            Sign up today and start participating.
          </p>
          <Link
            to="/register"
            className="d-interactive"
            style={{
              padding: '0.625rem 2rem',
              fontSize: '1rem',
              textDecoration: 'none',
              background: '#fff',
              color: 'var(--d-primary)',
              borderColor: '#fff',
              fontWeight: 600,
            }}
          >
            Sign Up Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
