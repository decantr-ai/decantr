import { useState } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Bot, Zap, Shield, Activity, Globe, Code2, ArrowRight,
  Check, X, Star, ChevronRight, Sparkles
} from 'lucide-react';

/* ─── Hero ─── */
function Hero() {
  return (
    <div className="d-section" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div className={css('_flex _col _aic _gap6')} style={{ maxWidth: '720px', margin: '0 auto' }}>
        <span className="d-annotation neon-border-glow" style={{ color: 'var(--d-accent)' }}>
          <Sparkles size={12} />
          Now in Public Beta
        </span>
        <h1
          className={css('_text3xl _fontbold')}
          style={{ lineHeight: 1.15, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          Orchestrate AI Agents{' '}
          <span style={{ color: 'var(--d-accent)' }} className="neon-text-glow">at Scale</span>
        </h1>
        <p
          className={css('_textlg')}
          style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, maxWidth: '560px' }}
        >
          Deploy, monitor, and coordinate autonomous agent swarms from a single mission control center. Real-time observability meets intelligent orchestration.
        </p>
        <div className={css('_flex _gap3')}>
          <Link
            to="/register"
            className={'d-interactive neon-glow-hover'}
            data-variant="primary"
            style={{ textDecoration: 'none' }}
          >
            Deploy First Agent
            <ArrowRight size={14} />
          </Link>
          <a
            href="#features"
            className={'d-interactive'}
            data-variant="ghost"
            style={{ textDecoration: 'none' }}
          >
            See Capabilities
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Features ─── */
const features = [
  { icon: Bot, title: 'Swarm Orchestration', desc: 'Deploy multi-agent topologies with drag-and-drop canvas. Auto-scaling based on workload.' },
  { icon: Activity, title: 'Real-time Monitoring', desc: 'Live metrics, trace logs, and anomaly detection across your entire agent fleet.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC2 compliant. Role-based access, audit logs, and encrypted agent communications.' },
  { icon: Zap, title: 'Sub-50ms Latency', desc: 'Edge-deployed orchestration layer for latency-critical agent coordination.' },
  { icon: Globe, title: 'Multi-region Deploy', desc: 'Distribute agents across global regions with automatic failover and replication.' },
  { icon: Code2, title: 'API-first Design', desc: 'Full REST and WebSocket APIs. SDKs for Python, TypeScript, Go, and Rust.' },
];

function Features() {
  return (
    <div id="features" className="d-section" style={{ padding: 'var(--d-section-py) 0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className={css('_textc _flex _col _gap2 _mb8')}>
          <span className={css('_textxs _uppercase _fontsemi') + ' d-label'} style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center' }}>
            Capabilities
          </span>
          <h2 className={css('_text2xl _fontbold _textc')}>Everything You Need to Command</h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
            A complete toolkit for building, deploying, and monitoring autonomous agent systems.
          </p>
        </div>
        <div className={css('_grid _gc3 _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className={css('_flex _col _gap3 _p5') + ' d-surface carbon-card neon-glow-hover'}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={22} style={{ color: 'var(--d-accent)' }} />
              </div>
              <h3 className={css('_textsm _fontsemi')}>{title}</h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── How It Works ─── */
const steps = [
  { num: 1, title: 'Define Agents', desc: 'Describe agent capabilities, inputs, and outputs using our declarative config.' },
  { num: 2, title: 'Connect Topology', desc: 'Wire agents together in the visual canvas. Set communication protocols and triggers.' },
  { num: 3, title: 'Deploy & Monitor', desc: 'One-click deploy to production. Real-time dashboards show health, latency, and throughput.' },
  { num: 4, title: 'Iterate & Scale', desc: 'Auto-scaling adjusts resources. A/B test agent versions with zero-downtime rollouts.' },
];

function HowItWorks() {
  return (
    <div className="d-section" style={{ padding: 'var(--d-section-py) 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className={css('_textc _flex _col _gap2 _mb8')}>
          <span className={css('_textxs _uppercase _fontsemi') + ' d-label'} style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center' }}>
            How It Works
          </span>
          <h2 className={css('_text2xl _fontbold _textc')}>From Concept to Production in Minutes</h2>
        </div>
        <div className={css('_flex _col _gap6 _rel')} style={{ paddingLeft: '40px' }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '24px',
              bottom: '24px',
              width: '2px',
              background: 'var(--d-border)',
            }}
          />
          {steps.map(({ num, title, desc }) => (
            <div key={num} className={css('_flex _gap4 _aic _rel')}>
              <div
                className="neon-glow"
                style={{
                  position: 'absolute',
                  left: '-24px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--d-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#000',
                  zIndex: 1,
                  flexShrink: 0,
                }}
              >
                {num}
              </div>
              <div className={css('_flex _col _gap1')}>
                <h3 className={css('_textsm _fontsemi')}>{title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing ─── */
interface Tier {
  name: string;
  price: { monthly: string; annual: string };
  features: { label: string; included: boolean }[];
  recommended?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Starter',
    price: { monthly: '$29', annual: '$24' },
    features: [
      { label: '5 concurrent agents', included: true },
      { label: 'Basic monitoring', included: true },
      { label: 'Community support', included: true },
      { label: 'Custom integrations', included: false },
      { label: 'SLA guarantee', included: false },
    ],
  },
  {
    name: 'Pro',
    price: { monthly: '$99', annual: '$79' },
    recommended: true,
    features: [
      { label: '50 concurrent agents', included: true },
      { label: 'Advanced monitoring', included: true },
      { label: 'Priority support', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'SLA guarantee', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: '$299', annual: '$249' },
    features: [
      { label: 'Unlimited agents', included: true },
      { label: 'Full observability', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Custom integrations', included: true },
      { label: '99.99% SLA', included: true },
    ],
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div id="pricing" className="d-section" style={{ padding: 'var(--d-section-py) 0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className={css('_textc _flex _col _gap2 _mb6')}>
          <span className={css('_textxs _uppercase _fontsemi') + ' d-label'} style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center' }}>
            Pricing
          </span>
          <h2 className={css('_text2xl _fontbold _textc')}>Scale as You Grow</h2>
        </div>

        {/* Billing toggle */}
        <div className={css('_flex _aic _jcc _gap3 _mb8')}>
          <span className={css('_textsm')} style={{ color: annual ? 'var(--d-text-muted)' : 'var(--d-text)' }}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            role="switch"
            aria-checked={annual}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: annual ? 'var(--d-accent)' : 'var(--d-border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.25s ease',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: annual ? '22px' : '2px',
                transition: 'left 0.25s ease',
              }}
            />
          </button>
          <span className={css('_textsm _flex _aic _gap1')} style={{ color: annual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
            Annual
            {annual && <span className="d-annotation" data-status="success">Save 20%</span>}
          </span>
        </div>

        {/* Tier cards */}
        <div className={css('_grid _gap4 _aic')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={css('_flex _col _gap4 _p6') + ' d-surface carbon-card'}
              style={{
                borderColor: tier.recommended ? 'var(--d-accent)' : undefined,
                boxShadow: tier.recommended ? '0 0 20px var(--d-accent-glow)' : undefined,
                transform: tier.recommended ? 'scale(1.02)' : undefined,
                position: 'relative',
              }}
            >
              {tier.recommended && (
                <span
                  className="d-annotation"
                  data-status="info"
                  style={{ position: 'absolute', top: '-10px', right: '16px' }}
                >
                  Recommended
                </span>
              )}
              <h3 className={css('_textsm _fontsemi')}>{tier.name}</h3>
              <div className={css('_flex _aic _aibl _gap1')}>
                <span className={css('_text3xl _fontbold') + ' mono-data'}>
                  {annual ? tier.price.annual : tier.price.monthly}
                </span>
                <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>/mo</span>
              </div>

              <ul className={css('_flex _col _gap2')}>
                {tier.features.map(f => (
                  <li key={f.label} className={css('_flex _aic _gap2 _textsm')}>
                    {f.included
                      ? <Check size={14} style={{ color: 'var(--d-success)' }} />
                      : <X size={14} style={{ color: 'var(--d-text-muted)', opacity: 0.3 }} />
                    }
                    <span style={{ color: f.included ? 'var(--d-text)' : 'var(--d-text-muted)' }}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={css('_wfull _textc') + ' d-interactive' + (tier.recommended ? ' neon-glow-hover' : '')}
                data-variant={tier.recommended ? 'primary' : 'ghost'}
                style={{ textDecoration: 'none', justifyContent: 'center' }}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Testimonials ─── */
const testimonials = [
  { quote: 'Nexus replaced our entire custom orchestration layer. Deployment time went from days to minutes.', name: 'Sarah Chen', role: 'CTO, DataFlow Inc.', rating: 5 },
  { quote: 'The real-time monitoring alone is worth 10x the price. We caught a critical cascade failure before it hit production.', name: 'Marcus Rodriguez', role: 'SRE Lead, Apex AI', rating: 5 },
  { quote: 'Clean API, excellent docs, and the agent marketplace saved us months of development.', name: 'Priya Sharma', role: 'VP Engineering, NovaTech', rating: 5 },
];

function Testimonials() {
  return (
    <div className="d-section" style={{ padding: 'var(--d-section-py) 0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className={css('_textc _flex _col _gap2 _mb8')}>
          <span className={css('_textxs _uppercase _fontsemi') + ' d-label'} style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center' }}>
            Testimonials
          </span>
          <h2 className={css('_text2xl _fontbold _textc')}>Trusted by Engineering Teams</h2>
        </div>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {testimonials.map(t => (
            <div key={t.name} className={css('_flex _col _gap4 _p6') + ' d-surface carbon-card'}>
              <div className={css('_flex _gap1')}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} style={{ color: 'var(--d-warning)', fill: 'var(--d-warning)' }} />
                ))}
              </div>
              <p className={css('_textsm _italic')} style={{ color: 'var(--d-text)', lineHeight: 1.7 }}>
                "{t.quote}"
              </p>
              <div className={css('_flex _aic _gap3')}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--d-accent)',
                  }}
                >
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={css('_flex _col')}>
                  <span className={css('_textsm _fontmedium')}>{t.name}</span>
                  <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <div
      className="d-section"
      style={{
        padding: 'var(--d-section-py) 0',
        background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--d-accent) 5%, transparent) 50%, transparent 100%)',
      }}
    >
      <div className={css('_flex _col _aic _gap6 _textc')} style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1.5rem' }}>
        <h2 className={css('_text2xl _fontbold')}>Ready to Command Your Swarm?</h2>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7 }}>
          Start deploying intelligent agents in minutes. No credit card required.
        </p>
        <div className={css('_flex _gap3')}>
          <Link
            to="/register"
            className={'d-interactive neon-glow-hover'}
            data-variant="primary"
            style={{ textDecoration: 'none' }}
          >
            Start Free Trial
            <ArrowRight size={14} />
          </Link>
          <a
            href="#"
            className={'d-interactive'}
            data-variant="ghost"
            style={{ textDecoration: 'none' }}
          >
            Talk to Sales
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Home Page ─── */
export function Home() {
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
