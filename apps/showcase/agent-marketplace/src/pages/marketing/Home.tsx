import { useState } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Bot, Zap, Shield, Workflow, BarChart3, Globe,
  ArrowRight, Check, Star, ChevronRight,
} from 'lucide-react';

/* ── Hero ── */
function HeroSection() {
  return (
    <section className={css('_flex _col _aic _textc _py12 _px4') + ' d-section'}>
      <span
        className="d-annotation"
        data-status="info"
        style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          color: 'var(--d-accent)',
          marginBottom: '1.5rem',
          padding: '0.25rem 0.75rem',
        }}
      >
        <Zap size={12} /> Now in Public Beta
      </span>
      <h1
        className={css('_fontsemi') + ' mono-data neon-text-glow'}
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, maxWidth: '720px' }}
      >
        The Operating System for AI Agents
      </h1>
      <p
        className={css('_mt4') + ' mono-data'}
        style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, maxWidth: '540px', fontSize: '1.0625rem' }}
      >
        Deploy, orchestrate, and monitor autonomous agent swarms. One control plane. Zero guesswork.
      </p>
      <div className={css('_flex _gap3 _mt6')}>
        <Link
          to="/register"
          className="d-interactive neon-glow-hover"
          data-variant="primary"
          style={{ textDecoration: 'none', padding: '0.625rem 1.5rem' }}
        >
          Get Started <ArrowRight size={16} />
        </Link>
        <Link
          to="/marketplace"
          className="d-interactive"
          data-variant="ghost"
          style={{ textDecoration: 'none', padding: '0.625rem 1.5rem' }}
        >
          Browse Marketplace
        </Link>
      </div>

      {/* Ambient visualization — floating metrics */}
      <div className={css('_flex _gap4 _mt8 _wrap _jcc')}>
        {[
          { label: 'Agents Deployed', value: '14,200+' },
          { label: 'Avg Latency', value: '89ms' },
          { label: 'Uptime', value: '99.97%' },
        ].map(stat => (
          <div
            key={stat.label}
            className={css('_flex _col _aic _p3') + ' mono-data'}
            style={{ opacity: 0.7 }}
          >
            <span className={css('_textxl _fontsemi') + ' neon-text-glow'}>{stat.value}</span>
            <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Features ── */
const features = [
  { icon: Bot, title: 'Agent Management', description: 'Deploy and manage autonomous agents with real-time status monitoring and one-click controls.' },
  { icon: Workflow, title: 'Swarm Orchestration', description: 'Drag-and-connect agent workflows. Automatic routing, load balancing, and fallback chains.' },
  { icon: Shield, title: 'Safety & Guardrails', description: 'Built-in content moderation, rate limiting, circuit breakers, and audit logging.' },
  { icon: BarChart3, title: 'Observability', description: 'Full inference tracing, confidence scoring, and neural feedback visualization.' },
  { icon: Globe, title: 'Marketplace', description: 'Browse and deploy community-built agents. One-click integration into your swarm.' },
  { icon: Zap, title: 'Real-time WebSockets', description: 'Live agent status, metric streaming, and instant alerts. Zero polling.' },
];

function FeaturesSection() {
  return (
    <section className={css('_px4') + ' d-section'} style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div className={css('_textc _mb8')}>
        <span className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center', display: 'block' }}>
          CAPABILITIES
        </span>
        <h2 className={css('_text2xl _fontsemi _mt2') + ' mono-data'}>
          Everything You Need to Ship AI
        </h2>
      </div>
      <div className={css('_grid _gc1 _md:gc2 _lg:gc3 _gap4')}>
        {features.map(feat => {
          const Icon = feat.icon;
          return (
            <div key={feat.title} className={css('_flex _col _gap3 _p4') + ' d-surface carbon-glass neon-glow-hover'}>
              <div
                className={css('_flex _aic _jcc _roundedlg')}
                style={{ width: '40px', height: '40px', background: 'rgba(0, 212, 255, 0.1)' }}
              >
                <Icon size={20} style={{ color: 'var(--d-accent)' }} />
              </div>
              <h3 className={css('_fontmedium') + ' mono-data'}>{feat.title}</h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── How it Works ── */
const steps = [
  { num: '01', title: 'Define Your Agents', description: 'Describe agent roles, models, and capabilities in a simple configuration.' },
  { num: '02', title: 'Wire the Swarm', description: 'Connect agents visually on the canvas. Define data flows and fallback routes.' },
  { num: '03', title: 'Deploy & Monitor', description: 'One-click deployment with real-time observability, tracing, and alerting.' },
];

function HowItWorksSection() {
  return (
    <section className={css('_px4') + ' d-section'} style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className={css('_textc _mb8')}>
        <span className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center', display: 'block' }}>
          HOW IT WORKS
        </span>
        <h2 className={css('_text2xl _fontsemi _mt2') + ' mono-data'}>
          Three Steps to Production
        </h2>
      </div>
      <div className={css('_flex _col _gap6')}>
        {steps.map(step => (
          <div key={step.num} className={css('_flex _gap4 _aic')}>
            <div
              className={css('_flex _aic _jcc _shrink0 _fontsemi') + ' mono-data neon-text-glow'}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px solid var(--d-accent)',
                color: 'var(--d-accent)',
                boxShadow: '0 0 12px var(--d-accent-glow)',
              }}
            >
              {step.num}
            </div>
            <div className={css('_flex _col _gap1')}>
              <h3 className={css('_fontmedium') + ' mono-data'}>{step.title}</h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing ── */
interface Tier {
  name: string;
  price: { monthly: string; annual: string };
  description: string;
  features: string[];
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Starter',
    price: { monthly: '$0', annual: '$0' },
    description: 'For individuals experimenting with AI agents.',
    features: ['3 agents', '1,000 requests/day', 'Community support', 'Basic monitoring'],
  },
  {
    name: 'Pro',
    price: { monthly: '$49', annual: '$39' },
    description: 'For teams building production agent systems.',
    features: ['25 agents', '100,000 requests/day', 'Priority support', 'Full observability', 'Custom models', 'Webhooks & alerts'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', annual: 'Custom' },
    description: 'For organizations with custom requirements.',
    features: ['Unlimited agents', 'Unlimited requests', 'Dedicated support', 'SLA guarantee', 'SSO & RBAC', 'On-premise option'],
  },
];

function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className={css('_px4') + ' d-section'} style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div className={css('_textc _mb8')}>
        <span className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center', display: 'block' }}>
          PRICING
        </span>
        <h2 className={css('_text2xl _fontsemi _mt2') + ' mono-data'}>
          Simple, Transparent Pricing
        </h2>
        {/* Billing toggle */}
        <div className={css('_flex _aic _jcc _gap3 _mt4')}>
          <span className={css('_textsm') + ' mono-data'} style={{ color: annual ? 'var(--d-text-muted)' : 'var(--d-text)' }}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={css('_shrink0 _rounded')}
            style={{
              width: '40px',
              height: '22px',
              background: annual ? 'var(--d-accent)' : 'var(--d-surface-raised)',
              border: '1px solid var(--d-border)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
            }}
            aria-label="Toggle annual billing"
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: annual ? '20px' : '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
          <span className={css('_textsm') + ' mono-data'} style={{ color: annual ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
            Annual <span className="d-annotation" data-status="success" style={{ marginLeft: '0.25rem' }}>Save 20%</span>
          </span>
        </div>
      </div>

      <div className={css('_grid _gc1 _lg:gc3 _gap4')}>
        {tiers.map(tier => (
          <div
            key={tier.name}
            className={css('_flex _col _gap4 _p5') + ' d-surface carbon-glass' + (tier.highlighted ? ' neon-border-glow' : '')}
          >
            {tier.highlighted && (
              <span className="d-annotation" data-status="info" style={{ alignSelf: 'flex-start', color: 'var(--d-accent)', background: 'rgba(0,212,255,0.1)' }}>
                Most Popular
              </span>
            )}
            <div>
              <h3 className={css('_fontmedium _textlg') + ' mono-data'}>{tier.name}</h3>
              <p className={css('_textsm _mt1')} style={{ color: 'var(--d-text-muted)' }}>{tier.description}</p>
            </div>
            <div>
              <span className={css('_text2xl _fontsemi') + ' mono-data neon-text-glow'}>
                {annual ? tier.price.annual : tier.price.monthly}
              </span>
              {tier.price.monthly !== 'Custom' && (
                <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>/mo</span>
              )}
            </div>
            <ul className={css('_flex _col _gap2')}>
              {tier.features.map(feat => (
                <li key={feat} className={css('_flex _aic _gap2 _textsm')}>
                  <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                  {feat}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={css('_wfull _jcc') + ' d-interactive' + (tier.highlighted ? ' neon-glow-hover' : '')}
              data-variant={tier.highlighted ? 'primary' : 'ghost'}
              style={{ textDecoration: 'none', marginTop: 'auto' }}
            >
              Get Started <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const testimonials = [
  { quote: 'Nexus cut our agent deployment time from days to minutes. The swarm canvas is incredible.', author: 'Sarah Chen', role: 'CTO, AutoML Labs', rating: 5 },
  { quote: 'Finally, real observability for AI agents. The neural feedback loop visualization is a game-changer.', author: 'Marcus Rivera', role: 'ML Lead, DataForge', rating: 5 },
  { quote: 'The marketplace alone saved us months. We found production-ready agents for every use case.', author: 'Aiko Tanaka', role: 'Founder, SynthAI', rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className={css('_px4') + ' d-section'} style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div className={css('_textc _mb8')}>
        <span className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', textAlign: 'center', display: 'block' }}>
          TESTIMONIALS
        </span>
        <h2 className={css('_text2xl _fontsemi _mt2') + ' mono-data'}>
          Trusted by AI Engineers
        </h2>
      </div>
      <div className={css('_grid _gc1 _lg:gc3 _gap4')}>
        {testimonials.map(t => (
          <div key={t.author} className={css('_flex _col _gap3 _p4') + ' d-surface carbon-glass'}>
            <div className={css('_flex _gap1')}>
              {Array.from({ length: t.rating }, (_, i) => (
                <Star key={i} size={14} fill="var(--d-warning)" style={{ color: 'var(--d-warning)' }} />
              ))}
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{t.quote}"
            </p>
            <div className={css('_flex _aic _gap2 _mt1')}>
              <div
                className={css('_flex _aic _jcc _roundedfull _shrink0') + ' mono-data'}
                style={{ width: '32px', height: '32px', background: 'var(--d-surface-raised)', fontSize: '0.75rem', color: 'var(--d-accent)' }}
              >
                {t.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <span className={css('_textsm _fontmedium')}>{t.author}</span>
                <span className={css('_textxs _block')} style={{ color: 'var(--d-text-muted)' }}>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── CTA ── */
function CtaSection() {
  return (
    <section
      className={css('_px4 _textc') + ' d-section'}
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.05) 50%, transparent 100%)',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className={css('_text2xl _fontsemi') + ' mono-data neon-text-glow'}>
          Ready to Deploy Your Swarm?
        </h2>
        <p className={css('_mt3 _textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7 }}>
          Join thousands of AI engineers building the future of autonomous systems. Free tier included.
        </p>
        <div className={css('_flex _gap3 _jcc _mt6')}>
          <Link
            to="/register"
            className="d-interactive neon-glow-hover"
            data-variant="primary"
            style={{ textDecoration: 'none', padding: '0.625rem 1.5rem' }}
          >
            Start Building <ArrowRight size={16} />
          </Link>
          <Link
            to="/marketplace"
            className="d-interactive"
            data-variant="ghost"
            style={{ textDecoration: 'none', padding: '0.625rem 1.5rem' }}
          >
            Explore Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Home Page ── */
export function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
