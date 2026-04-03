import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, Target, Shield, Zap, Users, Globe } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Mission-First',
    description:
      'Every feature exists to give operators full control over their agent fleet. No bloat, no vanity metrics.',
  },
  {
    icon: Shield,
    title: 'Trust by Default',
    description:
      'Transparent inference logs, confidence scoring, and audit trails. Operators see exactly what their agents do and why.',
  },
  {
    icon: Zap,
    title: 'Speed of Thought',
    description:
      'Sub-200ms response times across the orchestration layer. Real-time WebSocket telemetry. Zero polling.',
  },
  {
    icon: Users,
    title: 'Operator-Centric',
    description:
      'Built for platform engineers and ML teams who deploy agents at scale — not for demos or proofs of concept.',
  },
  {
    icon: Globe,
    title: 'Open Orchestration',
    description:
      'Model-agnostic agent orchestration. Connect GPT, Claude, Mistral, or any LLM behind a unified control plane.',
  },
  {
    icon: Bot,
    title: 'Autonomous by Design',
    description:
      'Agents operate independently with configurable guardrails. Human-in-the-loop when you need it, fully autonomous when you don\'t.',
  },
];

const MILESTONES = [
  { year: '2024', event: 'AgentOps founded. First orchestration prototype deployed internally.' },
  { year: '2024', event: 'Closed seed round. Launched private beta with 12 design partners.' },
  { year: '2025', event: 'Public launch. 1,000+ agents deployed in first 90 days.' },
  { year: '2025', event: 'Marketplace launched. 50+ pre-built agent templates available.' },
  { year: '2026', event: 'Enterprise tier. SOC 2 compliance. 10M+ monthly inferences.' },
];

const TEAM = [
  { name: 'Kira Nakamura', role: 'CEO & Co-founder', initials: 'KN' },
  { name: 'Marcus Chen', role: 'CTO & Co-founder', initials: 'MC' },
  { name: 'Priya Sharma', role: 'VP Engineering', initials: 'PS' },
  { name: 'Alex Reeves', role: 'Head of Product', initials: 'AR' },
];

export function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="d-section" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            className={css('_flex _aic _jcc _gap2')}
            style={{ marginBottom: '1.5rem' }}
          >
            <Bot size={32} style={{ color: 'var(--d-accent)' }} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2, marginBottom: '1rem' }}>
            The control plane for{' '}
            <span className="neon-text-glow" style={{ color: 'var(--d-accent)' }}>
              autonomous agents
            </span>
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            AgentOps gives platform teams the infrastructure to deploy, monitor, and orchestrate
            AI agent fleets at scale — with full observability and zero guesswork.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="d-section" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto' }}>
          <div
            className="d-label"
            style={{
              textAlign: 'center',
              color: 'var(--d-accent)',
              letterSpacing: '0.1em',
              fontSize: 11,
              marginBottom: '2rem',
            }}
          >
            OUR VALUES
          </div>
          <div
            className={css('_grid _gap6')}
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {VALUES.map(v => (
              <div key={v.title} className="d-surface carbon-card" style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--d-radius)',
                    background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <v.icon size={18} style={{ color: 'var(--d-accent)' }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="d-section" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div
            className="d-label"
            style={{
              textAlign: 'center',
              color: 'var(--d-accent)',
              letterSpacing: '0.1em',
              fontSize: 11,
              marginBottom: '2rem',
            }}
          >
            OUR JOURNEY
          </div>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Vertical line */}
            <div
              style={{
                position: 'absolute',
                left: 16,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'var(--d-border)',
                transform: 'translateX(-50%)',
              }}
            />
            <div className={css('_flex _col _gap6')}>
              {MILESTONES.map((m, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Orb */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -32 + 16 - 5,
                      top: 4,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--d-accent)',
                      border: '2px solid var(--d-bg)',
                    }}
                  />
                  <div>
                    <span
                      className="mono-data"
                      style={{ fontSize: 12, color: 'var(--d-accent)', marginRight: 8 }}
                    >
                      {m.year}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--d-text)', lineHeight: 1.6 }}>
                      {m.event}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="d-section" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            className="d-label"
            style={{
              textAlign: 'center',
              color: 'var(--d-accent)',
              letterSpacing: '0.1em',
              fontSize: 11,
              marginBottom: '2rem',
            }}
          >
            LEADERSHIP
          </div>
          <div
            className={css('_grid _gap4')}
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
          >
            {TEAM.map(t => (
              <div
                key={t.name}
                className={css('_flex _col _aic')}
                style={{ textAlign: 'center', padding: '1rem' }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    border: '2px solid var(--d-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--d-font-mono)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--d-text-muted)',
                  }}
                >
                  {t.initials}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--d-text-muted)', marginTop: 2 }}>
                  {t.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="d-section carbon-glass"
        style={{ padding: '3rem 1.5rem', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Deploy your first agent fleet
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
          >
            Join the operators building autonomous systems with full observability and control.
          </p>
          <div className={css('_flex _aic _jcc _gap3')}>
            <Link
              to="/register"
              className="d-interactive neon-glow"
              data-variant="primary"
              style={{ textDecoration: 'none', fontSize: 14 }}
            >
              Deploy Now
            </Link>
            <Link
              to="/"
              className="d-interactive"
              data-variant="ghost"
              style={{ textDecoration: 'none', fontSize: 14 }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
