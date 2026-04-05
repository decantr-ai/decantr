import { Link } from 'react-router-dom';
import { Building2, Users, Wrench, DollarSign, FileText, Shield, Check, ArrowRight } from 'lucide-react';

const features = [
  { icon: Building2, title: 'Portfolio dashboard', description: 'Every property, unit, and KPI in one place. Real-time occupancy, revenue, and alerts.' },
  { icon: Users, title: 'Resident directory', description: 'Tenant profiles with lease history, payment records, and communication logs.' },
  { icon: Wrench, title: 'Maintenance Kanban', description: 'Tickets flow from new to resolved. Assign vendors, track priority, attach photos.' },
  { icon: DollarSign, title: 'Rent collection', description: 'Automated ACH, card payments, and late-fee rules. Collection rate 98%+.' },
  { icon: FileText, title: 'Rent roll & P&L', description: 'Conservative financial reporting owners can forward to their accountant.' },
  { icon: Shield, title: 'Tenant portal', description: 'Residents pay rent, submit tickets, and access documents on their phone.' },
];

const testimonials = [
  { quote: 'Cornerstone cut our turn time by 40%. The maintenance workflow is the best I\'ve used.', author: 'Margaret Liu', title: 'Owner, 62-unit portfolio' },
  { quote: 'Owner statements ship on the 1st. Every month. That alone paid for the platform.', author: 'James Park', title: 'Principal, Sterling Residential' },
  { quote: 'Residents actually use the portal. Our call volume dropped dramatically.', author: 'Dana Wright', title: 'Operations Director' },
];

const pricing = [
  { name: 'Solo', price: '$49', period: '/mo', description: 'For owners with 1-10 units', features: ['Up to 10 units', 'Tenant portal', 'Online rent collection', 'Maintenance tracking', 'Basic reports'] },
  { name: 'Growth', price: '$149', period: '/mo', description: 'For growing portfolios', features: ['Up to 50 units', 'Everything in Solo', 'Custom owner statements', 'Vendor management', 'Priority support'], featured: true },
  { name: 'Enterprise', price: 'Custom', period: '', description: 'For professional managers', features: ['Unlimited units', 'Everything in Growth', 'Multi-org accounts', 'API access', 'Dedicated success manager'] },
];

export function MarketingHomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="pm-hero-bg" style={{ padding: '6rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <span className="d-annotation" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            Trusted by 240+ property managers
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem', color: 'var(--d-primary)' }}>
            Property management,<br />
            <span className="pm-gradient-text">serious about money, friendly about people.</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', marginBottom: '2rem', maxWidth: 680, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            The operations platform owners, managers, and residents actually enjoy using. Portfolio dashboards, rent rolls, and tenant self-service — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="pm-button-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="d-interactive" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
              Book a demo
            </Link>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
            <span>No credit card required</span>
            <span>14-day free trial</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Features</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--d-primary)' }}>Everything you need to run properties</h2>
            <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', marginTop: '0.75rem' }}>
              Built for the operators. Designed for the residents.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => (
              <div key={f.title} className="pm-feature-tile">
                <div className="pm-feature-icon">
                  <f.icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--d-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Testimonials</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--d-primary)' }}>Operators trust us with their portfolios</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map(t => (
              <div key={t.author} className="pm-card" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--d-primary)' }}>{t.author}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{t.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '5rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Pricing</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--d-primary)' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', marginTop: '0.75rem' }}>
              No setup fees. No per-transaction cuts. Just a flat monthly rate.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {pricing.map(p => (
              <div key={p.name} className="pm-card" style={{
                padding: '1.75rem',
                border: p.featured ? '2px solid var(--d-accent)' : undefined,
                position: 'relative',
              }}>
                {p.featured && (
                  <div style={{ position: 'absolute', top: -11, right: 20, background: 'var(--d-accent)', color: '#fff', padding: '0.25rem 0.625rem', borderRadius: 'var(--d-radius-full)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Most popular
                  </div>
                )}
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--d-primary)', marginBottom: '0.25rem' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--d-primary)' }}>{p.price}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--d-text-muted)' }}>{p.period}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>{p.description}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {p.features.map(feat => (
                    <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Check size={16} style={{ color: 'var(--d-success)', flexShrink: 0, marginTop: 2 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={p.featured ? 'pm-button-primary' : 'd-interactive'} style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--d-primary)' }}>
            Ready to run properties like a pro?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', marginBottom: '1.75rem' }}>
            Join operators managing over 18,000 units on Cornerstone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="pm-button-primary" style={{ padding: '0.75rem 1.5rem' }}>
              Start free trial
            </Link>
            <Link to="/contact" className="d-interactive" style={{ padding: '0.75rem 1.5rem' }}>
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
