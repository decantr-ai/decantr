import { NavLink } from 'react-router-dom';
import {
  LineChart as LineIcon, Search, GitBranch, Bell, Activity, Zap, Check,
} from 'lucide-react';
import { marketingFeatures, marketingTiers, marketingTestimonials, marketingStats } from '@/data/mock';

const iconMap: Record<string, typeof Activity> = {
  'line-chart': LineIcon, search: Search, 'git-branch': GitBranch, bell: Bell, activity: Activity, zap: Zap,
};

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '5rem 2rem 4rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div className="fin-badge" style={{ margin: '0 auto 1rem', display: 'inline-flex' }}>
          <span className="fin-status-dot" data-health="healthy" /> LIVE · 2.4B events/sec ingested
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Observability without limits.
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--d-text-muted)', maxWidth: 640, margin: '0 auto 1.75rem' }}>
          Unified metrics, logs, and traces. Built for SRE teams that ship fast.
          Sub-second queries against 30-day retention. Zero-config instrumentation.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <NavLink to="/register" className="d-interactive" data-variant="primary" style={{ padding: '8px 16px' }}>
            Start free — 30 days
          </NavLink>
          <NavLink to="/metrics" className="d-interactive" data-variant="ghost" style={{ padding: '8px 16px' }}>
            View live demo
          </NavLink>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '3rem' }}>
          {marketingStats.map(s => (
            <div key={s.label} className="fin-card" style={{ textAlign: 'left' }}>
              <div className="fin-label">{s.label}</div>
              <div className="fin-metric" data-size="lg" style={{ marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div className="fin-label" style={{ marginBottom: 8 }}>Platform</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Three signals. One platform.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {marketingFeatures.map(f => {
            const Icon = iconMap[f.icon] ?? Activity;
            return (
              <div key={f.title} className="fin-card">
                <Icon size={18} style={{ color: 'var(--d-primary)', marginBottom: 10 }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{f.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div className="fin-label" style={{ marginBottom: 8 }}>Pricing</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Per-host pricing. No data caps.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {marketingTiers.map(tier => (
            <div
              key={tier.name}
              className="fin-card"
              data-elevated={tier.recommended ? 'true' : undefined}
              style={{ borderColor: tier.recommended ? 'var(--d-primary)' : undefined, padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{tier.name}</div>
                {tier.recommended && <span className="fin-badge" data-severity="info">Recommended</span>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <span className="fin-metric" data-size="xl">${tier.price}</span>
                <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>{tier.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.8rem' }}>
                    <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0, marginTop: 2 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <NavLink
                to="/register"
                className="d-interactive"
                data-variant={tier.recommended ? 'primary' : 'ghost'}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px' }}
              >
                {tier.cta}
              </NavLink>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '3rem 2rem 4rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div className="fin-label" style={{ marginBottom: 8 }}>Customers</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Trusted by SRE teams.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {marketingTestimonials.map(t => (
            <div key={t.author} className="fin-card">
              <p style={{ fontSize: '0.85rem', lineHeight: 1.55, marginBottom: 10 }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 600 }}>{t.author}</div>
                <div style={{ color: 'var(--d-text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '3rem 2rem 5rem' }}>
        <div className="fin-card" data-elevated="true" style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', padding: '2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>Ship with confidence.</h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Start monitoring in 60 seconds. No credit card, no commitment.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <NavLink to="/register" className="d-interactive" data-variant="primary" style={{ padding: '8px 16px' }}>Start free trial</NavLink>
            <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '8px 16px' }}>Sign in</NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
