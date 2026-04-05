import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  { name: 'Starter', price: 0, highlight: false, tagline: 'For creators finding their first hundred fans.', features: ['Unlimited posts', 'Up to 3 tiers', '92% revenue share', 'Weekly payouts', 'Fan messaging'] },
  { name: 'Studio', price: 12, highlight: true, tagline: 'For creators running a real business.', features: ['Everything in Starter', 'Unlimited tiers', 'Custom domain', 'Promo codes', 'CSV exports', 'Priority support'] },
  { name: 'Boutique', price: 48, highlight: false, tagline: 'For established creators with teams.', features: ['Everything in Studio', 'Team seats', 'White-label checkout', 'API access', 'Dedicated manager'] },
];

export function PricingPage() {
  return (
    <div className="entrance-fade studio-hero-gradient" style={{ padding: '5rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="serif-display" style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>Pricing that scales with your work</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem' }}>No per-subscriber fees. No surprise charges. Ever.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {plans.map((p) => (
            <div key={p.name} className={p.highlight ? 'studio-card-premium' : 'studio-card'} style={{ padding: p.highlight ? 0 : '2rem' }}>
              <div className={p.highlight ? 'inner' : ''} style={p.highlight ? { padding: '2rem' } : {}}>
                {p.highlight && <div className="studio-badge-tier" data-tier="super" style={{ marginBottom: '0.75rem' }}>Most popular</div>}
                <h3 className="serif-display" style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>{p.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{p.tagline}</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>${p.price}</span>
                  <span style={{ color: 'var(--d-text-muted)' }}>/mo</span>
                </div>
                <Link to="/register" className="d-interactive" data-variant={p.highlight ? 'primary' : 'ghost'}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.625rem 1rem', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
                  Start free
                </Link>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {p.features.map((f) => (
                    <li key={f} className={css('_flex _aic _gap2')} style={{ fontSize: '0.875rem' }}>
                      <Check size={14} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
