import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Shield, Zap, Activity, GitBranch, Eye,
  Network, Cpu, BarChart3, Lock, Globe, Layers,
  Check, X, Star, ArrowRight, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

/* ── Mock data ── */
const FEATURES = [
  { icon: Bot, title: 'Autonomous Agents', desc: 'Deploy self-managing AI agents that execute multi-step workflows without human intervention.' },
  { icon: Network, title: 'Swarm Orchestration', desc: 'Coordinate agent fleets with real-time topology visualization and dependency mapping.' },
  { icon: Shield, title: 'Guard Rails', desc: 'Built-in safety constraints with configurable drift detection and automatic rollback.' },
  { icon: Activity, title: 'Live Monitoring', desc: 'Real-time telemetry, inference logging, and confidence distribution tracking.' },
  { icon: Eye, title: 'Full Transparency', desc: 'Inspect every decision, tool call, and reasoning step across your agent pipeline.' },
  { icon: Layers, title: 'Marketplace', desc: 'Browse and deploy pre-built agent templates from the community marketplace.' },
];

const STEPS = [
  { title: 'Configure', desc: 'Define agent parameters, model selection, and safety constraints.' },
  { title: 'Deploy', desc: 'Launch agents to your infrastructure with one-click deployment.' },
  { title: 'Monitor', desc: 'Track performance, inspect logs, and visualize agent interactions.' },
  { title: 'Iterate', desc: 'Refine agent behavior using real-time feedback and A/B testing.' },
];

const PLANS = [
  { name: 'Starter', monthly: 29, annual: 23, features: ['5 agents', '10k requests/mo', 'Basic monitoring', 'Community support', 'Email alerts'], recommended: false },
  { name: 'Pro', monthly: 99, annual: 79, features: ['25 agents', '100k requests/mo', 'Advanced monitoring', 'Priority support', 'Webhooks', 'Custom models'], recommended: true },
  { name: 'Enterprise', monthly: 299, annual: 239, features: ['Unlimited agents', 'Unlimited requests', 'Full observability', 'Dedicated support', 'SSO & SAML', 'SLA guarantee', 'Custom integrations'], recommended: false },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'CTO, DataForge', text: 'AgentOps transformed how we handle data pipelines. Our agents process 10x more data with zero manual intervention.', avatar: 'SC' },
  { name: 'Marcus Rivera', role: 'ML Lead, Nexus AI', text: 'The transparency dashboard is phenomenal. We can trace every decision our agents make in production.', avatar: 'MR' },
  { name: 'Emily Zhang', role: 'VP Engineering, Cortex', text: 'Swarm orchestration let us coordinate 50 agents seamlessly. The real-time canvas is like mission control.', avatar: 'EZ' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [billingAnnual, setBillingAnnual] = useState(false);

  return (
    <div data-theme="carbon-neon">
      {/* ── Hero ── */}
      <section
        className="d-section"
        style={{
          padding: '6rem 1.5rem 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--d-accent) 8%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 60% 40%, color-mix(in srgb, var(--d-primary) 6%, transparent) 0%, transparent 50%)`,
        }}
        role="banner"
      >
        {/* Ambient glow behind heading area */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            borderRadius: '50%',
            background: 'var(--d-accent-glow)',
            filter: 'blur(120px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div
            className="d-annotation neon-border-glow"
            style={{
              display: 'inline-flex',
              marginBottom: '1.5rem',
              background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)',
              color: 'var(--d-accent)',
              border: '1px solid color-mix(in srgb, var(--d-accent) 30%, transparent)',
              padding: '0.25rem 0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            <Zap size={12} /> Now in Public Beta
          </div>

          <h1
            className={css('_fontbold')}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
            }}
          >
            Deploy Autonomous{' '}
            <span className="neon-text-glow" style={{ color: 'var(--d-accent)' }}>AI Agents</span>{' '}
            at Scale
          </h1>

          <p
            className={css('_textlg')}
            style={{
              color: 'var(--d-text-muted)',
              lineHeight: 1.7,
              maxWidth: 600,
              margin: '0 auto 2rem',
            }}
          >
            Monitor, configure, and orchestrate agent swarms with real-time observability.
            Every decision traced. Every action auditable.
          </p>

          <div className={css('_flex _aic _jcc _gap3 _wrap')}>
            <button
              className="d-interactive neon-glow-hover"
              data-variant="primary"
              onClick={() => navigate('/register')}
              style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}
            >
              Deploy Your First Agent <ArrowRight size={16} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => navigate('/marketplace')}
              style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}
            >
              Browse Marketplace <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          background: 'var(--d-surface)',
        }}
        role="region"
        aria-label="Features"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>CAPABILITIES</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Everything You Need to Run Agent Fleets
          </h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', maxWidth: 500, margin: '0 auto 3rem' }}>
            Purpose-built infrastructure for autonomous AI operations.
          </p>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="carbon-card"
                style={{
                  padding: 'var(--d-surface-p)',
                  animationDelay: `${i * 80}ms`,
                  transition: 'transform 200ms var(--d-easing), border-color 200ms var(--d-easing), box-shadow 200ms var(--d-easing)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--d-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '0.5rem',
                    background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <f.icon size={22} style={{ color: 'var(--d-accent)' }} />
                </div>
                <h3 className={css('_fontsemi')} style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }} role="list" aria-label="How it works">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>HOW IT WORKS</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '3rem' }}>
            From Configuration to Production in Minutes
          </h2>

          <div className={css('_grid _gap8')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', position: 'relative' }}>
            {STEPS.map((step, i) => (
              <div key={step.title} className={css('_flex _col _aic _textc')} style={{ position: 'relative' }} role="listitem">
                {/* Connecting line to next step */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 24,
                      left: 'calc(50% + 28px)',
                      width: 'calc(100% - 8px)',
                      height: 2,
                      background: `linear-gradient(90deg, var(--d-border), color-mix(in srgb, var(--d-border) 40%, transparent))`,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--d-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    marginBottom: '1rem',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 0 0 4px var(--d-bg), 0 0 0 6px color-mix(in srgb, var(--d-primary) 30%, transparent)',
                  }}
                >
                  {i + 1}
                </div>
                <h3 className={css('_fontsemi')} style={{ marginBottom: '0.5rem' }}>{step.title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem' }} role="region" aria-label="Pricing">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>PRICING</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Simple, Transparent Pricing
          </h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
            Scale your agent fleet without surprises.
          </p>

          {/* Billing toggle */}
          <div className={css('_flex _aic _jcc _gap3')} style={{ marginBottom: '2.5rem' }}>
            <span className={css('_textsm')} style={{ color: billingAnnual ? 'var(--d-text-muted)' : 'var(--d-text)' }}>Monthly</span>
            <button
              onClick={() => setBillingAnnual(!billingAnnual)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: billingAnnual ? 'var(--d-primary)' : 'var(--d-border)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 250ms var(--d-easing)',
              }}
              aria-label="Toggle annual billing"
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: billingAnnual ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 250ms var(--d-easing)',
                }}
              />
            </button>
            <span className={css('_textsm')} style={{ color: billingAnnual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
              Annual
              <span className="d-annotation" data-status="success" style={{ marginLeft: '0.5rem' }}>Save 20%</span>
            </span>
          </div>

          {/* Tier cards */}
          <div className={css('_grid _gap4 _aic')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={'d-surface carbon-card' + (plan.recommended ? ' neon-border-glow' : '')}
                style={{
                  padding: '2rem',
                  borderColor: plan.recommended ? 'var(--d-accent)' : undefined,
                  borderTop: plan.recommended ? '3px solid var(--d-primary)' : undefined,
                  transform: plan.recommended ? 'scale(1.02)' : undefined,
                  boxShadow: plan.recommended ? '0 0 30px rgba(99, 102, 241, 0.15)' : undefined,
                  position: 'relative',
                }}
              >
                {plan.recommended && (
                  <span
                    className="d-annotation"
                    data-status="info"
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      background: 'var(--d-accent)',
                      color: '#000',
                      fontWeight: 600,
                    }}
                  >
                    Recommended
                  </span>
                )}
                <h3 className={css('_fontsemi')} style={{ marginBottom: '0.25rem' }}>{plan.name}</h3>
                <div className={css('_flex _aic _aibl _gap1')} style={{ marginBottom: '1.5rem' }}>
                  <span className={css('_fontbold') + ' mono-data'} style={{ fontSize: '2.5rem' }}>
                    ${billingAnnual ? plan.annual : plan.monthly}
                  </span>
                  <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>/mo</span>
                </div>
                <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                  {plan.features.map(f => (
                    <li key={f} className={css('_flex _aic _gap2 _textsm')}>
                      <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="d-interactive"
                  data-variant={plan.recommended ? 'primary' : 'ghost'}
                  onClick={() => navigate('/register')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Deploy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          background: 'linear-gradient(180deg, var(--d-bg), color-mix(in srgb, var(--d-surface) 30%, var(--d-bg)))',
        }}
        role="region"
        aria-label="Testimonials"
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>TESTIMONIALS</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '3rem' }}>
            Trusted by Engineering Teams
          </h2>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {TESTIMONIALS.map((t, i) => {
              const borderColors = ['var(--d-accent)', 'var(--d-primary)', 'var(--d-secondary)'];
              return (
                <div
                  key={t.name}
                  className="d-surface carbon-card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `3px solid ${borderColors[i % borderColors.length]}`,
                  }}
                >
                  <div style={{ color: borderColors[i % borderColors.length], marginBottom: '0.75rem', fontSize: '2rem', lineHeight: 1, opacity: 0.4 }}>&ldquo;</div>
                  <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '1rem' }}>
                    {t.text}
                  </p>
                  <div className={css('_flex _aic _gap3')}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--d-surface-raised)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: 'var(--d-accent)',
                        outline: `2px solid var(--d-primary)`,
                        outlineOffset: 2,
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className={css('_textsm _fontmedium')}>{t.name}</p>
                      <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 8%, var(--d-bg)), color-mix(in srgb, var(--d-accent) 5%, var(--d-bg)))',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden',
        }}
        role="complementary"
      >
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 300,
            borderRadius: '50%',
            background: 'var(--d-accent-glow)',
            filter: 'blur(140px)',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <h2 className={css('_fontsemi')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Ready to Deploy Your First Agent?
          </h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join hundreds of teams running autonomous AI agents with full observability and confidence.
          </p>
          <div className={css('_flex _aic _jcc _gap3 _wrap')}>
            <button
              className="d-interactive neon-glow-hover"
              data-variant="primary"
              onClick={() => navigate('/register')}
              style={{ fontSize: '1.0625rem', padding: '0.75rem 2rem' }}
            >
              Deploy Agent <ArrowRight size={16} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => navigate('/login')}
              style={{ fontSize: '1.0625rem', padding: '0.75rem 2rem' }}
            >
              Log In
            </button>
          </div>
          {/* Trust indicators */}
          <div className={css('_flex _aic _jcc _gap6 _wrap')} style={{ marginTop: '2rem' }}>
            {['SOC 2 Compliant', 'Free for up to 5 agents', '99.9% Uptime SLA'].map(label => (
              <span key={label} className={css('_flex _aic _gap1 _textxs')} style={{ color: 'var(--d-text-muted)' }}>
                <Shield size={12} style={{ color: 'var(--d-accent)', flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
