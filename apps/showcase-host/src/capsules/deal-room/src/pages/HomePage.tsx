import { NavLink } from 'react-router-dom';
import {
  Shield, FileText, GitBranch, MessageCircle, Users, BarChart2,
  ArrowRight, Check,
} from 'lucide-react';
import { platformFeatures, testimonials, pricingTiers, platformStats } from '@/data/mock';

const iconMap: Record<string, typeof Shield> = {
  shield: Shield, 'file-text': FileText, 'git-branch': GitBranch,
  'message-circle': MessageCircle, users: Users, 'bar-chart-2': BarChart2,
};

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="dr-hero">
        <div className="dr-orb dr-orb-1" />
        <div className="dr-orb dr-orb-2" />
        <div style={{ position: 'relative', maxWidth: 920, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div className="dr-confidential-badge">
            <Shield size={10} /> Bank-Grade Security
          </div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.75rem)', fontWeight: 700, lineHeight: 1.1, textAlign: 'center', letterSpacing: '-0.01em' }}>
            The deal room built<br />for institutional capital
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--d-text-muted)', maxWidth: 600, textAlign: 'center' }}>
            Secure document management, stage gate workflows, investor collaboration, and complete audit trails — purpose-built for private equity.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <NavLink to="/register" className="dr-button-primary" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Request Access <ArrowRight size={14} />
            </NavLink>
            <NavLink to="/about" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Learn More
            </NavLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginTop: '3rem', width: '100%', maxWidth: 680 }}>
            {platformStats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="serif-display" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)' }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--d-font-mono)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="serif-display" style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Every tool your deal team needs</h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1rem' }}>Six pillars that protect your transactions and accelerate closings.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
          {platformFeatures.map(f => {
            const Icon = iconMap[f.icon] || Shield;
            return (
              <div key={f.title} className="dr-card" style={{ padding: '1.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--d-radius-sm)', background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={18} style={{ color: 'var(--d-primary)' }} />
                </div>
                <h3 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="serif-display" style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Transparent pricing</h2>
          <p style={{ color: 'var(--d-text-muted)' }}>No hidden fees. No per-document charges. Scale with confidence.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', maxWidth: 1000, margin: '0 auto' }}>
          {pricingTiers.map(t => (
            <div
              key={t.name}
              className="dr-card"
              style={{
                padding: '1.75rem',
                border: t.recommended ? '1px solid var(--d-primary)' : undefined,
                position: 'relative',
              }}
            >
              {t.recommended && (
                <div style={{
                  position: 'absolute', top: -10, left: '1.75rem',
                  background: 'var(--d-primary)', color: '#0A0E1A', fontSize: '0.6rem',
                  fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--d-radius-sm)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>Most Popular</div>
              )}
              <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.25rem' }}>
                <span className="serif-display" style={{ fontSize: '2rem', fontWeight: 600 }}>${t.price.toLocaleString()}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{t.period}</span>
              </div>
              <button
                className={t.recommended ? 'dr-button-primary' : 'd-interactive'}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '1.25rem' }}
              >
                {t.cta}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {t.features.map(feat => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <Check size={14} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />
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
          <h2 className="serif-display" style={{ fontSize: '2rem', fontWeight: 600 }}>Trusted by the world's leading firms</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
          {testimonials.map(t => (
            <div key={t.author} className="dr-card" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1rem', color: 'var(--d-text)', fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--d-font-display)' }}>{t.author}</div>
                <div style={{ color: 'var(--d-text-muted)' }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Close with confidence.</h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.75rem' }}>
            Join the firms that trust Meridian to manage their most sensitive transactions.
          </p>
          <NavLink to="/register" className="dr-button-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>
            Request a Demo <ArrowRight size={14} />
          </NavLink>
        </div>
      </section>
    </>
  );
}
