import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Bot, Zap, Shield, Eye, Network, Gauge,
  ArrowRight, Check, Star, Quote,
} from 'lucide-react';
import { StatusRing } from '../../components/StatusRing';

/* ── Hero ── */
function Hero() {
  return (
    <section className="d-section" style={{ paddingTop: 'var(--d-gap-12)', paddingBottom: 'var(--d-gap-12)' }}>
      <div className={css('_flex _col _aic')} style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '0 var(--d-gap-4)' }}>
        <span className="d-annotation mono-data" data-status="info" style={{ marginBottom: 'var(--d-gap-4)' }}>
          v2.4 — Swarm Orchestration Now Available
        </span>
        <h1 className="neon-entrance" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, marginBottom: 'var(--d-gap-4)' }}>
          The mission control for{' '}
          <span style={{ color: 'var(--d-accent)' }} className="neon-text-glow">
            autonomous agents
          </span>
        </h1>
        <p className="mono-data neon-entrance" style={{ fontSize: '1rem', color: 'var(--d-text-muted)', maxWidth: 540, lineHeight: 1.7, marginBottom: 'var(--d-gap-6)', animationDelay: '50ms' }}>
          Deploy, monitor, and orchestrate AI agent swarms with real-time observability, safety guardrails, and one-click marketplace deployments.
        </p>
        <div className={css('_flex _gap3 _wrap _jcc') + ' neon-entrance'} style={{ animationDelay: '100ms' }}>
          <Link
            to="/register"
            className="d-interactive neon-glow-hover"
            style={{ background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)', fontWeight: 500, fontSize: '0.9375rem', padding: 'var(--d-gap-3) var(--d-gap-6)' }}
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <Link
            to="/agents"
            className="d-interactive neon-glow-hover"
            data-variant="ghost"
            style={{ fontSize: '0.9375rem', padding: 'var(--d-gap-3) var(--d-gap-6)', border: '1px solid var(--d-border)' }}
          >
            View Dashboard
          </Link>
        </div>

        {/* Decorative agent preview */}
        <div
          className="neon-entrance"
          style={{
            marginTop: 'var(--d-gap-8)',
            width: '100%',
            maxWidth: 600,
            animationDelay: '150ms',
          }}
        >
          <div
            className="d-surface carbon-glass"
            style={{
              padding: 'var(--d-gap-4)',
              display: 'flex',
              gap: 'var(--d-gap-3)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {[
              { name: 'Alpha', status: 'active' as const },
              { name: 'Miner', status: 'active' as const },
              { name: 'Guard', status: 'warning' as const },
              { name: 'Deploy', status: 'error' as const },
            ].map((a) => (
              <div key={a.name} className={css('_flex _col _aic _gap1')}>
                <StatusRing status={a.status} size={36}>
                  <Bot size={16} style={{ color: a.status === 'active' ? 'var(--d-accent)' : a.status === 'error' ? 'var(--d-error)' : 'var(--d-warning)' }} />
                </StatusRing>
                <span className="mono-data" style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)' }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon: Bot, title: 'Agent Swarms', description: 'Deploy and coordinate multiple AI agents with visual topology mapping.' },
  { icon: Eye, title: 'Real-time Observability', description: 'Monitor inference logs, confidence scores, and neural feedback in real time.' },
  { icon: Shield, title: 'Safety Guardrails', description: 'Content filtering, rate limiting, and anomaly detection built in.' },
  { icon: Network, title: 'Orchestration', description: 'Visual node graph for connecting agents into processing pipelines.' },
  { icon: Gauge, title: 'Performance Metrics', description: 'Throughput, latency, and token consumption tracking per agent.' },
  { icon: Zap, title: 'One-click Deploy', description: 'Browse the marketplace and deploy community agents instantly.' },
];

function Features() {
  return (
    <section className="d-section">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--d-gap-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--d-gap-8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 'var(--d-gap-2)' }}>
            Built for <span style={{ color: 'var(--d-accent)' }}>operators</span>
          </h2>
          <p className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            Every feature serves a purpose. No fluff.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--d-gap-4)' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="d-surface carbon-glass neon-glow-hover neon-entrance" data-interactive="">
              <f.icon size={20} style={{ color: 'var(--d-accent)', marginBottom: 'var(--d-gap-3)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 'var(--d-gap-2)' }}>{f.title}</h3>
              <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
const STEPS = [
  { step: 1, title: 'Deploy', description: 'Pick an agent from the marketplace or configure your own.' },
  { step: 2, title: 'Orchestrate', description: 'Connect agents into swarms using the visual topology editor.' },
  { step: 3, title: 'Monitor', description: 'Watch real-time inference, confidence, and performance metrics.' },
  { step: 4, title: 'Guard', description: 'Set safety guardrails and get alerts when thresholds are exceeded.' },
];

function HowItWorks() {
  return (
    <section className="d-section">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 var(--d-gap-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--d-gap-8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 'var(--d-gap-2)' }}>How it works</h2>
          <p className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            Four steps from zero to production agents.
          </p>
        </div>
        <div className={css('_flex _col _gap6')}>
          {STEPS.map((s) => (
            <div key={s.step} className={css('_flex _gap4 _aic') + ' neon-entrance'}>
              <div
                className={css('_flex _aic _jcc') + ' mono-data neon-ring neon-ring-active'}
                style={{
                  width: 44,
                  height: 44,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--d-accent)',
                  flexShrink: 0,
                }}
              >
                {s.step}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 'var(--d-gap-1)' }}>{s.title}</h3>
                <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    features: ['3 agents', '10k requests/mo', 'Community support', 'Basic monitoring'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Operator',
    price: '$49',
    period: '/month',
    features: ['25 agents', '500k requests/mo', 'Priority support', 'Full observability', 'Custom guardrails', 'Webhook integrations'],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited agents', 'Unlimited requests', 'Dedicated support', 'SSO & RBAC', 'On-prem deployment', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section className="d-section">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--d-gap-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--d-gap-8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 'var(--d-gap-2)' }}>Pricing</h2>
          <p className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            Scale from prototype to production.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--d-gap-4)', alignItems: 'start' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={'d-surface carbon-glass neon-entrance' + (plan.highlighted ? ' neon-border-glow' : ' neon-glow-hover')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--d-gap-4)',
              }}
            >
              {plan.highlighted && (
                <span className="d-annotation" data-status="success" style={{ alignSelf: 'flex-start' }}>
                  Popular
                </span>
              )}
              <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>{plan.name}</h3>
              <div className={css('_flex _aic')} style={{ gap: '0.25rem' }}>
                <span className="mono-data" style={{ fontSize: '2rem', fontWeight: 600 }}>{plan.price}</span>
                <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{plan.period}</span>
              </div>
              <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem' }}>
                    <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                    <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="d-interactive neon-glow-hover"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontWeight: 500,
                  ...(plan.highlighted
                    ? { background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)' }
                    : { border: '1px solid var(--d-border)' }),
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const TESTIMONIALS = [
  { quote: 'SWARM.CTL replaced our entire monitoring stack. The real-time observability is unmatched.', name: 'Sarah Chen', role: 'CTO, DeepScale AI', stars: 5 },
  { quote: 'We went from 2 agents to 40 in a week. The marketplace made it possible.', name: 'Marcus Webb', role: 'Lead Engineer, Nexus', stars: 5 },
  { quote: 'The safety guardrails saved us from a production incident on day one.', name: 'Aisha Patel', role: 'ML Platform, Synth Labs', stars: 5 },
];

function Testimonials() {
  return (
    <section className="d-section">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--d-gap-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--d-gap-8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 'var(--d-gap-2)' }}>Trusted by operators</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--d-gap-4)' }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="d-surface carbon-glass neon-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-3)' }}>
              <div className={css('_flex _gap1')}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} style={{ color: 'var(--d-accent)', fill: 'var(--d-accent)' }} />
                ))}
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>
                <Quote size={14} style={{ color: 'var(--d-accent)', display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {t.quote}
              </p>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{t.name}</span>
                <br />
                <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CtaSection() {
  return (
    <section className="d-section">
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          textAlign: 'center',
          padding: 'var(--d-gap-12) var(--d-gap-4)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 60%)',
          borderRadius: 'var(--d-radius-lg)',
          border: '1px solid var(--d-border)',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: 'var(--d-gap-3)' }}>
          Ready to deploy your <span style={{ color: 'var(--d-accent)' }} className="neon-text-glow">swarm</span>?
        </h2>
        <p className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--d-gap-6)' }}>
          Start free. Scale to production. No credit card required.
        </p>
        <div className={css('_flex _gap3 _jcc _wrap')}>
          <Link
            to="/register"
            className="d-interactive neon-glow-hover"
            style={{ background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)', fontWeight: 500, padding: 'var(--d-gap-3) var(--d-gap-6)' }}
          >
            Start Building <ArrowRight size={16} />
          </Link>
          <Link
            to="/marketplace"
            className="d-interactive neon-glow-hover"
            data-variant="ghost"
            style={{ padding: 'var(--d-gap-3) var(--d-gap-6)', border: '1px solid var(--d-border)' }}
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Page ── */
export function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CtaSection />
    </>
  );
}
