import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowRight, LayoutGrid, ChefHat, BookOpen, Package, BarChart3, Heart, Users } from 'lucide-react';

const features = [
  { icon: LayoutGrid, title: 'Floor Map', desc: 'Live table status, drag-to-seat, real-time covers.' },
  { icon: ChefHat, title: 'Kitchen Display', desc: 'Ticket rail with station routing and fire timers.' },
  { icon: BookOpen, title: 'Menu Engineering', desc: 'Profitability matrix, cost analysis, item popularity.' },
  { icon: Package, title: 'Inventory', desc: 'Par levels, depletion alerts, purchase orders.' },
  { icon: Heart, title: 'Loyalty', desc: 'Tiered rewards, guest history, preference tracking.' },
  { icon: BarChart3, title: 'P&L Reports', desc: 'Daily sales, labor cost, food cost at a glance.' },
];

const quotes = [
  { body: 'We cut food waste 22% in the first month just using the inventory alerts.', author: 'Sofia R.', role: 'Owner, Trattoria Mia' },
  { body: 'The KDS alone saved us from three lost tickets on a Friday night.', author: 'Marcus T.', role: 'Head Chef, The Spotted Pig' },
  { body: 'Our servers love the tip pool calculator. No more end-of-night arguments.', author: 'James P.', role: 'GM, Oak & Vine' },
];

export function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3rem', alignItems: 'center' }} className="hero-grid">
          <div className={css('_flex _col _gap4')}>
            <span className="bistro-stamp">New Platform</span>
            <h1 className="bistro-handwritten" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
              Your restaurant, <span style={{ color: 'var(--d-primary)' }}>running smoothly</span>.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: 520 }}>
              Tavola connects your floor, kitchen, menu, and team in one warm, intuitive workspace.
              From reservations to P&L — hospitality-first operations.
            </p>
            <div className={css('_flex _aic _gap3')}>
              <Link to="/register" className="d-interactive" data-variant="primary"
                style={{ textDecoration: 'none', padding: '0.625rem 1.25rem' }}>
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="d-interactive" data-variant="ghost"
                style={{ textDecoration: 'none', padding: '0.625rem 1.25rem' }}>
                Sign In
              </Link>
            </div>
            <div className={css('_flex _aic _gap6')} style={{ marginTop: '1rem' }}>
              <div>
                <div className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>2,400+</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Restaurants</div>
              </div>
              <div>
                <div className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>18M</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Covers served</div>
              </div>
              <div>
                <div className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>4.8</div>
                <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Avg rating</div>
              </div>
            </div>
          </div>

          {/* Floor map preview card */}
          <div className="bistro-warm-card" style={{ padding: '1.5rem', cursor: 'default' }}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1rem' }}>
              <span className="bistro-handwritten" style={{ fontSize: '1rem' }}>Live Floor</span>
              <span className="d-annotation" data-status="success">8 / 14 seated</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {['occupied','available','reserved','occupied','occupied','cleaning','available','occupied',
                'reserved','available','occupied','available','occupied','available'].map((s, i) => (
                <div key={i} className="table-shape" data-status={s}
                  style={{ width: '100%', aspectRatio: '1', fontSize: '0.625rem' }}>
                  T{i + 1}
                </div>
              ))}
            </div>
            <div className={css('_flex _aic _gap3')} style={{ marginTop: '0.75rem', justifyContent: 'center' }}>
              {(['available', 'occupied', 'reserved', 'cleaning'] as const).map(s => (
                <div key={s} className={css('_flex _aic _gap1')}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: s === 'available' ? 'var(--d-success)' : s === 'occupied' ? 'var(--d-primary)' : s === 'reserved' ? 'var(--d-info)' : 'var(--d-warning)' }} />
                  <span style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', textTransform: 'capitalize' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="d-label">Platform</span>
          <h2 className="bistro-handwritten" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Everything your restaurant needs</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {features.map((f) => (
            <div key={f.title} className="bistro-feature-tile">
              <f.icon size={24} style={{ color: 'var(--d-primary)', marginBottom: '0.75rem' }} />
              <h3 className="bistro-handwritten" style={{ fontSize: '1.125rem', marginBottom: '0.375rem' }}>{f.title}</h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="d-label">Testimonials</span>
          <h2 className="bistro-handwritten" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>From kitchens like yours</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {quotes.map((q) => (
            <div key={q.author} className="bistro-feature-tile">
              <p className="bistro-handwritten" style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
                &ldquo;{q.body}&rdquo;
              </p>
              <div>
                <div className={css('_textsm _fontmedium')}>{q.author}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{q.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="d-section" style={{ padding: '4rem 1.5rem' }}>
        <div className="bistro-daily" style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem', borderRadius: 'var(--d-radius-xl)' }}>
          <Users size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
          <h2 className="bistro-handwritten" style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#FFF7ED' }}>
            Ready to run a smoother service?
          </h2>
          <p style={{ color: 'rgba(255,247,237,0.8)', maxWidth: 520, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Free for your first location. No credit card required. Set up in under 10 minutes.
          </p>
          <Link to="/register" className="d-interactive" data-variant="primary"
            style={{ padding: '0.625rem 1.5rem', textDecoration: 'none', background: '#FFF7ED', color: '#431407', borderColor: '#FFF7ED' }}>
            <ArrowRight size={16} /> Get Started Free
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
