import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Sparkles, Zap, Shield, Code, GitBranch, MessageSquare,
  ArrowRight, Check, Quote,
} from 'lucide-react';

export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section
      style={{
        padding: '6rem 1.5rem 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--d-primary) 14%, transparent), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative' }}>
        <div
          className="d-annotation"
          style={{
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            background: 'color-mix(in srgb, var(--d-primary) 10%, var(--d-surface))',
            border: '1px solid color-mix(in srgb, var(--d-primary) 25%, var(--d-border))',
            color: 'var(--d-text)',
            padding: '0.25rem 0.75rem',
          }}
        >
          <Sparkles size={11} style={{ color: 'var(--d-accent)' }} /> Introducing carbon-4
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          The AI chatbot built for
          <br />
          <span style={{ color: 'var(--d-accent)' }}>serious work.</span>
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Thoughtful, measured responses. First-class code review. Conversations that remember context.
          Carbon is what happens when a chat assistant takes its craft seriously.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="d-interactive" data-variant="primary" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.25rem' }}>
            Start chat <ArrowRight size={15} />
          </Link>
          <Link to="/chat" className="d-interactive" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.25rem' }}>
            Try the demo
          </Link>
        </div>
      </div>
    </section>
  );
}

const featureList = [
  { icon: Sparkles, title: 'carbon-4 model', desc: 'Our most capable model, tuned for nuanced, technical conversation.' },
  { icon: Code, title: 'Code-first', desc: 'Syntax highlighting, diff rendering, and inline code review.' },
  { icon: GitBranch, title: 'Branch conversations', desc: 'Fork any message to explore alternatives without losing your thread.' },
  { icon: Shield, title: 'Private by default', desc: 'Your conversations are never used for training. Full data export anytime.' },
  { icon: Zap, title: 'Fast and focused', desc: 'Streaming responses, keyboard shortcuts, zero clutter.' },
  { icon: MessageSquare, title: 'Lasting memory', desc: 'Reference past conversations. Mention them inline with @.' },
];

function Features() {
  return (
    <section id="features" style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="d-label" style={{ marginBottom: '0.625rem' }}>Features</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Everything you need, nothing you don't.</h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {featureList.map((f) => (
            <div
              key={f.title}
              className="carbon-card"
              style={{
                padding: '1.5rem',
                background: 'var(--d-surface)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--d-radius-sm)',
                  background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface-raised))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.875rem',
                }}
              >
                <f.icon size={16} style={{ color: 'var(--d-accent)' }} />
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: '01', title: 'Sign in', desc: 'Create an account or continue with SSO.' },
  { n: '02', title: 'Start a conversation', desc: 'Ask anything — paste code, describe a problem, or explore an idea.' },
  { n: '03', title: 'Iterate together', desc: 'Branch, refine, and export your best conversations.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="d-label" style={{ marginBottom: '0.625rem' }}>How it works</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Three steps to better answers.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ padding: '1.25rem 0', borderTop: '1px solid var(--d-border)' }}>
              <div className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', marginBottom: '0.625rem' }}>{s.n}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = {
  monthly: [
    { name: 'Free', price: '$0', cadence: '/mo', features: ['50 messages/day', 'carbon-3 model', 'Basic export'], cta: 'Start free' },
    { name: 'Pro', price: '$20', cadence: '/mo', features: ['Unlimited messages', 'carbon-4 model', 'Branch & export', 'Priority support'], cta: 'Upgrade to Pro', highlighted: true },
    { name: 'Team', price: '$40', cadence: '/seat/mo', features: ['Everything in Pro', 'Shared conversations', 'Admin controls', 'SSO'], cta: 'Contact sales' },
  ],
  annual: [
    { name: 'Free', price: '$0', cadence: '/mo', features: ['50 messages/day', 'carbon-3 model', 'Basic export'], cta: 'Start free' },
    { name: 'Pro', price: '$16', cadence: '/mo', features: ['Unlimited messages', 'carbon-4 model', 'Branch & export', 'Priority support'], cta: 'Upgrade to Pro', highlighted: true },
    { name: 'Team', price: '$32', cadence: '/seat/mo', features: ['Everything in Pro', 'Shared conversations', 'Admin controls', 'SSO'], cta: 'Contact sales' },
  ],
};

function Pricing() {
  const [cadence, setCadence] = useState<'monthly' | 'annual'>('annual');
  const tiers = plans[cadence];
  return (
    <section id="pricing" style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="d-label" style={{ marginBottom: '0.625rem' }}>Pricing</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>Simple, fair pricing.</h2>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.25rem',
              background: 'var(--d-surface)',
              border: '1px solid var(--d-border)',
              borderRadius: 'var(--d-radius-full)',
              gap: '0.125rem',
            }}
          >
            {(['monthly', 'annual'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                style={{
                  padding: '0.375rem 1rem',
                  fontSize: '0.8125rem',
                  background: cadence === c ? 'var(--d-primary)' : 'transparent',
                  color: cadence === c ? '#fff' : 'var(--d-text-muted)',
                  border: 'none',
                  borderRadius: 'var(--d-radius-full)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                {c === 'monthly' ? 'Monthly' : 'Annual · save 20%'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="carbon-card"
              style={{
                padding: '1.5rem',
                background: 'var(--d-surface)',
                borderColor: tier.highlighted ? 'color-mix(in srgb, var(--d-primary) 45%, var(--d-border))' : undefined,
                boxShadow: tier.highlighted ? 'var(--d-shadow-md)' : undefined,
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>{tier.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{tier.price}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{tier.cadence}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {tier.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <Check size={13} style={{ color: 'var(--d-accent)', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="d-interactive"
                data-variant={tier.highlighted ? 'primary' : undefined}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: 'Carbon is the first chat assistant that actually helps me ship. The branching is addictive.',
    name: 'Julia Rodriguez',
    role: 'Staff Engineer at Stripe',
  },
  {
    quote: 'I replaced three tools with Carbon. The responses feel thoughtful, not canned.',
    name: 'Marcus Okafor',
    role: 'CTO at Tessera',
  },
  {
    quote: 'The code review quality is remarkable. Feels like pair-programming with a senior engineer.',
    name: 'Hannah Petrov',
    role: 'Founding Engineer at Linear',
  },
];

function Testimonials() {
  return (
    <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="d-label" style={{ marginBottom: '0.625rem' }}>Testimonials</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Loved by engineers who ship.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="carbon-card"
              style={{
                padding: '1.5rem',
                background: 'var(--d-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <Quote size={18} style={{ color: 'var(--d-accent)', opacity: 0.7 }} />
              <blockquote style={{ fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--d-text)' }}>
                {t.quote}
              </blockquote>
              <figcaption style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
      <div
        className="carbon-card"
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'color-mix(in srgb, var(--d-primary) 10%, var(--d-surface))',
          border: '1px solid color-mix(in srgb, var(--d-primary) 30%, var(--d-border))',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Ready to try a better chatbot?
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          Start free. Upgrade when you are ready. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="d-interactive" data-variant="primary" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.25rem' }}>
            Start chat <ArrowRight size={15} />
          </Link>
          <Link to="/contact" className="d-interactive" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.25rem' }}>
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
}
