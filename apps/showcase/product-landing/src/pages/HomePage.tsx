import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Check, Shield, Star, Quote } from 'lucide-react';
import { useState } from 'react';
import { FEATURES, WORKFLOW_STEPS, PRICING_TIERS, TESTIMONIALS, LOGOS } from '../data/mock';

export function HomePage() {
  const navigate = useNavigate();
  const [billingAnnual, setBillingAnnual] = useState(false);

  return (
    <div>
      {/* ── Split Hero ── */}
      <section
        className="d-section lum-orbs"
        style={{
          padding: '8rem 2rem 6rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
        }}
        role="banner"
      >
        {/* Background gradient */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--d-primary) 12%, transparent) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, color-mix(in srgb, var(--d-accent) 8%, transparent) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, color-mix(in srgb, var(--d-secondary, #0AF3EB) 5%, transparent) 0%, transparent 40%)
            `,
            pointerEvents: 'none',
          }}
        />

        <div
          className={css('_flex _aic _wrap _gap12')}
          style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative' }}
        >
          {/* Content — 2/3 */}
          <div style={{ flex: '2 1 400px' }}>
            <div
              className="d-annotation"
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
              <Star size={12} /> Now Generally Available
            </div>

            <h1
              className={css('_fontbold')}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
              }}
            >
              Build products{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                that convert
              </span>
            </h1>

            <p
              className={css('_textlg')}
              style={{
                color: 'var(--d-text-muted)',
                lineHeight: 1.7,
                maxWidth: 540,
                marginBottom: '2.5rem',
              }}
            >
              Composable design intelligence that transforms your vision into
              production-ready applications. Ship faster, look better, convert more.
            </p>

            <div className={css('_flex _aic _gap3 _wrap')}>
              <button
                className="d-interactive lum-btn-glow"
                data-variant="primary"
                onClick={() => navigate('/demo')}
                style={{
                  fontSize: '1.0625rem',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, var(--d-primary), color-mix(in srgb, var(--d-primary) 80%, var(--d-accent)))',
                  border: 'none',
                }}
              >
                Start Building <ArrowRight size={18} />
              </button>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => navigate('/demo')}
                style={{ fontSize: '1.0625rem', padding: '0.75rem 2rem' }}
              >
                See It in Action <ChevronRight size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className={css('_flex _aic _gap6 _wrap')} style={{ marginTop: '2.5rem' }}>
              {['SOC 2 Certified', '99.99% Uptime', 'GDPR Compliant'].map(label => (
                <span key={label} className={css('_flex _aic _gap1 _textxs')} style={{ color: 'var(--d-text-muted)' }}>
                  <Shield size={12} style={{ color: 'var(--d-secondary, #0AF3EB)', flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Visual — 1/3 */}
          <div
            style={{
              flex: '1 1 300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="lum-glass"
              style={{
                width: '100%',
                maxWidth: 400,
                aspectRatio: '4/3',
                borderRadius: 'var(--d-radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Simulated product preview */}
              <div
                style={{
                  width: '85%',
                  height: '75%',
                  borderRadius: 'var(--d-radius)',
                  background: 'var(--d-surface)',
                  border: '1px solid var(--d-border)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div className={css('_flex _gap2')}>
                  {['var(--d-primary)', 'var(--d-accent)', 'var(--d-secondary, #0AF3EB)'].map((c, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '30%', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ height: 12, width: '60%', background: 'var(--d-surface-raised)', borderRadius: 4 }} />
                    <div style={{ height: 8, width: '80%', background: 'var(--d-border)', borderRadius: 4 }} />
                    <div style={{ height: 8, width: '45%', background: 'var(--d-border)', borderRadius: 4 }} />
                    <div style={{ flex: 1 }} />
                    <div className={css('_flex _gap2')}>
                      <div style={{ height: 24, flex: 1, background: 'var(--d-primary)', borderRadius: 'var(--d-radius-sm)', opacity: 0.7 }} />
                      <div style={{ height: 24, flex: 1, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating accent orb */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, color-mix(in srgb, var(--d-accent) 30%, transparent), transparent)',
                  filter: 'blur(20px)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Logos ── */}
      <section
        className="d-section"
        style={{
          padding: '3rem 1.5rem',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            Trusted by forward-thinking teams
          </p>
          <div className={css('_flex _aic _jcc _gap8 _wrap')}>
            {LOGOS.map(name => (
              <span
                key={name}
                className={css('_fontmedium')}
                style={{ color: 'var(--d-text-muted)', fontSize: '1.125rem', opacity: 0.5, letterSpacing: '0.02em' }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
        role="region"
        aria-label="Features"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>CAPABILITIES</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Everything You Need to Ship
          </h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', maxWidth: 500, margin: '0 auto 3rem' }}>
            A complete platform for building, launching, and scaling modern web applications.
          </p>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="lum-card-vibrant"
                style={{
                  '--card-color': f.color,
                  animationDelay: `${i * 80}ms`,
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                } as React.CSSProperties}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <f.icon size={22} />
                </div>
                <h3 className={css('_fontsemi')} style={{ marginBottom: '0.5rem', fontSize: '1.0625rem' }}>{f.title}</h3>
                <p className={css('_textsm')} style={{ opacity: 0.85, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ── */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          background: 'var(--d-surface)',
        }}
        role="region"
        aria-label="How it works"
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>HOW IT WORKS</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '3rem' }}>
            From Vision to Production in Four Steps
          </h2>

          <div className={css('_grid _gap8')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', position: 'relative' }}>
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.title} className={css('_flex _col _aic _textc')} style={{ position: 'relative' }}>
                {i < WORKFLOW_STEPS.length - 1 && (
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
                  className="lum-stat-glow"
                  style={{
                    marginBottom: '1rem',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: `0 0 0 4px var(--d-surface), 0 0 0 6px color-mix(in srgb, var(--d-accent) 30%, transparent), 0 0 20px color-mix(in srgb, var(--d-accent) 20%, transparent)`,
                  }}
                >
                  {i + 1}
                </div>
                <step.icon size={20} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
                <h3 className={css('_fontsemi')} style={{ marginBottom: '0.5rem' }}>{step.title}</h3>
                <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Tiers ── */}
      <section
        className="d-section"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
        role="region"
        aria-label="Pricing"
      >
        <div style={{ maxWidth: 1050, margin: '0 auto' }}>
          <p className="d-label" style={{ textAlign: 'center', color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>PRICING</p>
          <h2 className={css('_fontsemi _textc')} style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Simple, Transparent Pricing
          </h2>
          <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
            Start free. Scale when you are ready. No surprises.
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
                transition: 'background 250ms ease',
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
                  transition: 'left 250ms ease',
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
            {PRICING_TIERS.map(tier => {
              const price = billingAnnual ? tier.annual : tier.monthly;
              return (
                <div
                  key={tier.name}
                  className="lum-card-outlined"
                  style={{
                    padding: '2rem',
                    '--card-color': tier.highlighted ? 'var(--d-primary)' : 'var(--d-border)',
                    borderColor: tier.highlighted ? 'var(--d-primary)' : undefined,
                    borderWidth: tier.highlighted ? 2 : 1,
                    transform: tier.highlighted ? 'scale(1.03)' : undefined,
                    position: 'relative',
                  } as React.CSSProperties}
                >
                  {tier.highlighted && (
                    <span
                      className="d-annotation"
                      data-status="info"
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: 16,
                        background: 'var(--d-primary)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      Most Popular
                    </span>
                  )}
                  <h3 className={css('_fontsemi')} style={{ marginBottom: '0.25rem' }}>{tier.name}</h3>
                  <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{tier.description}</p>
                  <div className={css('_flex _aic')} style={{ marginBottom: '1.5rem', gap: '0.25rem' }}>
                    <span className={css('_fontbold')} style={{ fontSize: '2.5rem' }}>
                      {price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {price > 0 && <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>/mo</span>}
                  </div>
                  <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                    {tier.features.map(f => (
                      <li key={f} className={css('_flex _aic _gap2 _textsm')}>
                        <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="d-interactive"
                    data-variant={tier.highlighted ? 'primary' : undefined}
                    onClick={() => navigate('/demo')}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: tier.highlighted
                        ? 'linear-gradient(135deg, var(--d-primary), color-mix(in srgb, var(--d-primary) 80%, var(--d-accent)))'
                        : undefined,
                      border: tier.highlighted ? 'none' : undefined,
                    }}
                  >
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Testimonials ── */}
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
            Loved by Teams Worldwide
          </h2>

          <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {TESTIMONIALS.map((t, i) => {
              const borderColors = ['var(--d-accent)', 'var(--d-primary)', 'var(--d-secondary, #0AF3EB)'];
              return (
                <div
                  key={t.name}
                  className="d-surface lum-card-outlined"
                  style={{
                    padding: '1.5rem',
                    '--card-color': borderColors[i % borderColors.length],
                    borderLeft: `3px solid ${borderColors[i % borderColors.length]}`,
                  } as React.CSSProperties}
                >
                  <Quote size={20} style={{ color: borderColors[i % borderColors.length], marginBottom: '0.75rem', opacity: 0.4 }} />
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
                        color: borderColors[i % borderColors.length],
                        outline: `2px solid ${borderColors[i % borderColors.length]}`,
                        outlineOffset: 2,
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className={css('_textsm _fontmedium')}>{t.name}</p>
                      <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{t.role}, {t.company}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="d-section lum-orbs"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          textAlign: 'center',
          background: `linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 10%, var(--d-bg)), color-mix(in srgb, var(--d-accent) 6%, var(--d-bg)))`,
          position: 'relative',
          overflow: 'hidden',
        }}
        role="complementary"
      >
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 className={css('_fontsemi')} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem', lineHeight: 1.15 }}>
            Ready to Build Something{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Extraordinary
            </span>?
          </h2>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Join thousands of developers and designers building the next generation of web experiences.
          </p>
          <div className={css('_flex _aic _jcc _gap3 _wrap')}>
            <button
              className="d-interactive lum-btn-glow"
              data-variant="primary"
              onClick={() => navigate('/demo')}
              style={{
                fontSize: '1.0625rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, var(--d-primary), color-mix(in srgb, var(--d-primary) 80%, var(--d-accent)))',
                border: 'none',
              }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => navigate('/resources')}
              style={{ fontSize: '1.0625rem', padding: '0.75rem 2rem' }}
            >
              Explore Resources
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
