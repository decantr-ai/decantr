import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Leaf, ShieldCheck } from 'lucide-react';
import { products } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';

export function HomePage() {
  const featured = products.filter(p => p.featured).slice(0, 4);
  return (
    <div>
      {/* Hero */}
      <section className="ec-hero">
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="ec-badge" style={{ marginBottom: '1.25rem' }}>Spring collection · 2026</div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem' }}>
            Goods made with <span className="ec-gradient-text">care</span>,<br /> built to last.
          </h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 2rem' }}>
            Curated apparel, home, and kitchen essentials from makers we trust. Free shipping on orders over $75.
          </p>
          <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/shop" className="ec-button-primary" style={{ padding: '0.875rem 1.5rem', fontSize: '0.95rem' }}>
              Shop the collection <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="d-interactive" style={{ padding: '0.875rem 1.5rem', fontSize: '0.95rem', background: 'var(--d-surface)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section style={{ padding: '3rem 2rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <Highlight icon={<Truck size={22} />} title="Free shipping" body="On every order above $75, worldwide." />
          <Highlight icon={<Leaf size={22} />} title="Sustainably sourced" body="From makers working with natural materials." />
          <Highlight icon={<ShieldCheck size={22} />} title="30-day returns" body="No questions, no fuss. Just bring it back." />
        </div>
      </section>

      {/* Featured products */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>Featured</div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Fresh from the studio</h2>
          </div>
          <Link to="/shop" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: '4rem 2rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>Loved by 14,000+ shoppers</div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 600 }}>From the community</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Elena P.', body: 'Every piece feels like an heirloom. The linen tote travels with me everywhere.' },
              { name: 'Marcus T.', body: 'Packaging, quality, service — Vinea gets every detail right.' },
              { name: 'Priya K.', body: 'The pour-over set changed my mornings. Worth every penny.' },
            ].map(r => (
              <div key={r.name} className="ec-card">
                <div className="ec-stars" style={{ marginBottom: '0.5rem' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>"{r.body}"</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', fontWeight: 600 }}>{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Ready to <span className="ec-gradient-text">find your next favorite</span>?
          </h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.75rem' }}>
            Browse the full collection — new arrivals every week.
          </p>
          <Link to="/shop" className="ec-button-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '0.95rem' }}>
            Start browsing <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Highlight({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ width: 44, height: 44, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', color: 'var(--d-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{body}</div>
      </div>
    </div>
  );
}
