import { NavLink } from 'react-router-dom';
import {
  Users, Key, Zap, Shield, CreditCard, Lock, ArrowRight, Check, BookOpen, Code,
} from 'lucide-react';
import { platformFeatures, testimonials, pricingTiers, platformStats } from '@/data/mock';

const iconMap: Record<string, typeof Users> = {
  users: Users, key: Key, zap: Zap, shield: Shield, 'credit-card': CreditCard, lock: Lock,
  'book-open': BookOpen, code: Code,
};

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="lp-header">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div style={{ position: 'relative', maxWidth: 920, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div className="d-annotation" data-status="info" style={{ fontSize: '0.7rem' }}>
            SOC 2 Type II · GDPR · HIPAA-ready
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.1, textAlign: 'center', letterSpacing: '-0.02em' }}>
            The platform layer<br />for multi-tenant SaaS
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--d-text-muted)', maxWidth: 640, textAlign: 'center' }}>
            Organizations, API keys, webhooks, audit logs, and usage-based billing — all wired together, ready to embed in your product.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <NavLink to="/register" className="lp-button-primary" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Start building <ArrowRight size={14} />
            </NavLink>
            <NavLink to="/docs" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Read the docs
            </NavLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginTop: '3rem', width: '100%', maxWidth: 680 }}>
            {platformStats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Everything you need — nothing you don't</h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1rem' }}>Six primitives that power thousands of production SaaS platforms.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
          {platformFeatures.map(f => {
            const Icon = iconMap[f.icon] || Zap;
            return (
              <div key={f.title} className="lp-card-elevated" style={{ padding: '1.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={18} style={{ color: 'var(--d-primary)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Simple, per-organization pricing</h2>
          <p style={{ color: 'var(--d-text-muted)' }}>Start free. Scale as you grow. No hidden fees.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', maxWidth: 1000, margin: '0 auto' }}>
          {pricingTiers.map(t => (
            <div
              key={t.name}
              className="lp-card-elevated"
              style={{
                padding: '1.75rem',
                border: t.recommended ? '1px solid var(--d-primary)' : undefined,
                position: 'relative',
              }}
            >
              {t.recommended && (
                <div style={{
                  position: 'absolute', top: -10, left: '1.75rem',
                  background: 'var(--d-primary)', color: '#fff', fontSize: '0.65rem',
                  fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--d-radius-sm)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Recommended</div>
              )}
              <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 600 }}>${t.price}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{t.period}</span>
              </div>
              <button
                className={t.recommended ? 'lp-button-primary' : 'd-interactive'}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '1.25rem' }}
              >
                {t.cta}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {t.features.map(feat => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Trusted by platform teams</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
          {testimonials.map(t => (
            <div key={t.author} className="lp-surface" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem', color: 'var(--d-text)' }}>"{t.quote}"</p>
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600 }}>{t.author}</div>
                <div style={{ color: 'var(--d-text-muted)' }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }} className="lp-gradient-mesh">
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ship your platform, not plumbing.</h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.75rem' }}>
            Join 28,000+ organizations building on Tenantly.
          </p>
          <NavLink to="/register" className="lp-button-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>
            Get started free <ArrowRight size={14} />
          </NavLink>
        </div>
      </section>
    </>
  );
}
