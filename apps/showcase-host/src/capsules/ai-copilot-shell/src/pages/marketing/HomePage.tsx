import { Link } from 'react-router-dom';
import {
  Brain, Code, Shield, Zap, GitBranch, Lock,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { features, howItWorksSteps } from '@/data/mock';

const iconMap: Record<string, React.ElementType> = {
  brain: Brain, code: Code, shield: Shield, zap: Zap,
  'git-branch': GitBranch, lock: Lock,
};

export function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="d-section"
        style={{
          textAlign: 'center',
          padding: '6rem 1.5rem 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(107,138,174,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div className="d-annotation" data-status="info" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <Sparkles size={12} />
            Now in public beta
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Your AI assistant,{' '}
            <span style={{ color: 'var(--d-accent)' }}>always in context</span>
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 2rem' }}>
            A sleek copilot panel that understands your workspace. Ask questions, generate code,
            and get suggestions without breaking your flow.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link
              to="/register"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, border: 'none' }}
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', border: 'none' }}
            >
              Sign In
            </Link>
          </div>

          {/* Visual proof — mock terminal */}
          <div
            className="carbon-code"
            style={{
              marginTop: '3rem',
              textAlign: 'left',
              fontSize: '0.8125rem',
              lineHeight: 1.8,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <span style={{ color: 'var(--d-text-muted)' }}>$</span>{' '}
            <span style={{ color: 'var(--d-accent)' }}>copilot</span>{' '}
            <span>explain this function</span>
            <br />
            <span style={{ color: 'var(--d-text-muted)' }}>{'>'}</span>{' '}
            <span style={{ color: 'var(--d-success)' }}>Analyzing validateToken()...</span>
            <br />
            <span style={{ color: 'var(--d-text-muted)' }}>{'>'}</span>{' '}
            This middleware verifies JWT signatures
            <br />
            <span style={{ color: 'var(--d-text-muted)' }}>{'>'}</span>{' '}
            and checks token expiry at the edge layer.
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem', background: 'var(--d-surface)' }}
        role="region"
        aria-label="Features"
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
              CAPABILITIES
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Built for focused work</h2>
            <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', marginTop: '0.5rem' }}>
              Everything you need from an AI assistant, nothing you don't.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {features.map((feat, i) => {
              const Icon = iconMap[feat.icon] || Zap;
              return (
                <div
                  key={i}
                  className="carbon-card"
                  style={{
                    padding: 'var(--d-surface-p)',
                    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--d-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--d-border)';
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--d-radius-lg)',
                    background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    <Icon size={22} style={{ color: 'var(--d-accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
        role="list"
        aria-label="How it works"
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
              HOW IT WORKS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Three steps to flow state</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute',
              top: 24,
              left: '16.67%',
              right: '16.67%',
              height: 2,
              background: 'linear-gradient(to right, transparent, var(--d-border), var(--d-border), transparent)',
            }} />

            {howItWorksSteps.map((step, i) => (
              <div
                key={i}
                role="listitem"
                aria-label={`Step ${step.number} of ${howItWorksSteps.length}: ${step.title}`}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--d-primary)',
                  color: '#fff', fontWeight: 700, fontSize: '1.125rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', position: 'relative', zIndex: 1,
                }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle glass background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, var(--d-surface), var(--d-bg))',
            opacity: 0.5,
          }}
        />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Ready to work smarter?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join developers who ship faster with an AI copilot that understands their codebase.
            Free during beta.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link
              to="/register"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, border: 'none' }}
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem', border: 'none' }}
            >
              View Documentation
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
