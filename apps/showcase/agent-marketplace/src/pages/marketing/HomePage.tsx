import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  ArrowRight,
  Check,
  Workflow,
  Activity,
  Brain,
  Store,
  Shield,
  Eye,
  Quote,
} from 'lucide-react';
import { SectionLabel } from '../../components/SectionLabel';
import {
  features as featureData,
  howItWorksSteps,
  pricingTiers,
  testimonials,
} from '../../data';

const iconMap: Record<string, typeof Workflow> = {
  Workflow,
  Activity,
  Brain,
  Store,
  Shield,
  Eye,
};

export function HomePage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* ── Hero Section ── */}
      {/* Per layout_hints: NO d-surface card wrapping visual proof. Clean ambient. */}
      <section className={css('_flex _col _aic _textc _px6') + ' d-section'} style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <span
          className={css('_textsm _mb4') + ' d-annotation neon-text-glow'}
          data-status="info"
        >
          AI Agent Orchestration Platform
        </span>
        <h1 className={css('_text4xl _fontbold _mb4')} style={{ maxWidth: '48rem' }}>
          Orchestrate autonomous agent{' '}
          <span style={{ color: 'var(--d-accent)' }} className="neon-text-glow">
            swarms
          </span>{' '}
          at scale
        </h1>
        <p
          className={css('_textlg _fgmuted _mb6')}
          style={{ maxWidth: '36rem', lineHeight: 1.7 }}
        >
          Deploy, monitor, and coordinate multi-agent systems with real-time observability,
          neural feedback loops, and a curated marketplace.
        </p>
        <div className={css('_flex _gap3')}>
          <Link
            to="/register"
            className={css('_textbase') + ' d-interactive neon-glow-hover'}
            data-variant="primary"
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <Link
            to="/agents"
            className={css('_textbase') + ' d-interactive'}
            data-variant="ghost"
          >
            View Dashboard
          </Link>
        </div>

        {/* Ambient accent glow — no card */}
        <div
          className={css('_mt12 _w100 _rounded')}
          style={{
            maxWidth: '48rem',
            height: '2px',
            background: 'linear-gradient(to right, transparent, var(--d-accent), transparent)',
            opacity: 0.5,
          }}
        />
      </section>

      {/* ── Features Section ── */}
      <section className="d-section">
        <div className={css('_container _textc')}>
          <SectionLabel centered>Capabilities</SectionLabel>
          <h2 className={css('_text2xl _fontsemi _mb8')}>
            Everything you need to run agent operations
          </h2>
          <div className={css('_grid _gc1 _md:gc2 _lg:gc3 _gap4')}>
            {featureData.map((feature) => {
              const Icon = iconMap[feature.icon] || Activity;
              return (
                <div
                  key={feature.title}
                  className={css('_flex _col _aic _textc _p6') + ' d-surface carbon-card neon-glow-hover'}
                  data-interactive=""
                >
                  <div
                    className={css('_flex _aic _jcc _mb4 _roundedfull')}
                    style={{
                      width: 48,
                      height: 48,
                      background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                    }}
                  >
                    <Icon size={22} style={{ color: 'var(--d-accent)' }} />
                  </div>
                  <h3 className={css('_fontsemi _mb2')}>{feature.title}</h3>
                  <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      {/* Per layout_hints: HORIZONTAL layout for ≤5 steps */}
      <section className="d-section">
        <div className={css('_container _textc')}>
          <SectionLabel centered>How It Works</SectionLabel>
          <h2 className={css('_text2xl _fontsemi _mb8')}>Three steps to agent mastery</h2>
          <div className={css('_grid _gc1 _md:gc3 _gap6')}>
            {howItWorksSteps.map((step) => (
              <div key={step.step} className={css('_flex _col _aic _textc _gap3')}>
                <div
                  className={css('_flex _aic _jcc _fontsemi _textlg _roundedfull') + ' mono-data neon-border-glow'}
                  style={{
                    width: 48,
                    height: 48,
                    color: 'var(--d-accent)',
                    background: 'color-mix(in srgb, var(--d-accent) 8%, transparent)',
                  }}
                >
                  {step.step}
                </div>
                <h3 className={css('_fontsemi')}>{step.title}</h3>
                <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section className="d-section">
        <div className={css('_container _textc')}>
          <SectionLabel centered>Pricing</SectionLabel>
          <h2 className={css('_text2xl _fontsemi _mb4')}>Simple, transparent pricing</h2>
          {/* Billing toggle */}
          <div className={css('_flex _aic _jcc _gap3 _mb8')}>
            <span className={css('_textsm') + (!annual ? ' _fgaccent' : ' _fgmuted')}>
              Monthly
            </span>
            <button
              className={css('_rel _pointer')}
              onClick={() => setAnnual((a) => !a)}
              aria-label="Toggle billing period"
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: annual ? 'var(--d-accent)' : 'var(--d-border)',
                border: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: annual ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--d-text)',
                  transition: 'left 0.15s ease',
                }}
              />
            </button>
            <span className={css('_textsm') + (annual ? ' _fgaccent' : ' _fgmuted')}>
              Annual
            </span>
          </div>

          <div className={css('_grid _gc1 _md:gc3 _gap4 _aic')}>
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={css('_flex _col _p6 _h100') + ' d-surface carbon-card' + (tier.highlighted ? ' neon-border-glow' : '')}
              >
                {tier.highlighted && (
                  <span className={css('_textxs _mb3') + ' d-annotation'} data-status="info">
                    Most Popular
                  </span>
                )}
                <h3 className={css('_fontsemi _textlg _mb1')}>{tier.name}</h3>
                <p className={css('_textsm _fgmuted _mb4')}>{tier.description}</p>
                <div className={css('_flex _aife _gap1 _mb4')}>
                  <span className={css('_text3xl _fontbold') + ' mono-data'}>
                    ${annual ? tier.annualPrice : tier.price}
                  </span>
                  <span className={css('_textsm _fgmuted _pb1')}>/mo</span>
                </div>
                <ul className={css('_flex _col _gap2 _mb6')}>
                  {tier.features.map((f) => (
                    <li key={f} className={css('_flex _aic _gap2 _textsm')}>
                      <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={css('_w100 _textc _mt0') + ' d-interactive neon-glow-hover'}
                  data-variant={tier.highlighted ? 'primary' : undefined}
                  style={{ marginTop: 'auto', justifyContent: 'center' }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="d-section">
        <div className={css('_container _textc')}>
          <SectionLabel centered>Testimonials</SectionLabel>
          <h2 className={css('_text2xl _fontsemi _mb8')}>Trusted by engineering teams</h2>
          <div className={css('_grid _gc1 _md:gc3 _gap4')}>
            {testimonials.map((t) => (
              <div
                key={t.author}
                className={css('_flex _col _p6 _textl') + ' d-surface carbon-card'}
              >
                <Quote size={20} style={{ color: 'var(--d-accent)', marginBottom: '0.75rem' }} />
                <p className={css('_textsm _mb4')} style={{ lineHeight: 1.7 }}>
                  {t.quote}
                </p>
                <div className={css('_flex _col')} style={{ marginTop: 'auto' }}>
                  <span className={css('_fontsemi _textsm')}>{t.author}</span>
                  <span className={css('_textxs _fgmuted')}>
                    {t.role}, {t.company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      {/* Per shell notes: CTA should stand out — glass effect */}
      <section className="d-section">
        <div
          className={css('_container _textc _py12 _px6 _roundedlg') + ' carbon-glass neon-glow'}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(31, 31, 35, 0.9))',
          }}
        >
          <h2 className={css('_text2xl _fontsemi _mb3')}>
            Ready to deploy your agent swarm?
          </h2>
          <p className={css('_fgmuted _mb6')} style={{ maxWidth: '32rem', margin: '0 auto 1.5rem' }}>
            Start with 3 free agents. No credit card required.
          </p>
          <Link
            to="/register"
            className={css('_textbase') + ' d-interactive neon-glow-hover'}
            data-variant="primary"
          >
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
