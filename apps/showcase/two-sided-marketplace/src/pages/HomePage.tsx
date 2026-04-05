import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, Zap, HeartHandshake, Star } from 'lucide-react';
import { listings, categories } from '@/data/mock';
import { ListingCard } from '@/components/ListingCard';

export function HomePage() {
  const featured = listings.filter(l => l.featured).slice(0, 4);
  return (
    <div>
      {/* Hero */}
      <section className="nm-hero">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="nm-badge" style={{ marginBottom: '1rem' }}>Spring 2026 · 14,000+ stays worldwide</div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem' }}>
            Unique stays, <span className="nm-gradient-text">fair to both sides</span>.
          </h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1.1rem', maxWidth: 620, margin: '0 auto 2rem' }}>
            Book confidently. Host transparently. A marketplace that works for travelers and the people who welcome them.
          </p>

          <div style={{ background: 'var(--d-surface)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius-full)', padding: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', boxShadow: 'var(--d-shadow)', maxWidth: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRight: '1px solid var(--d-border)' }}>
              <Search size={14} style={{ color: 'var(--d-text-muted)' }} />
              <input placeholder="Where" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', width: 110 }} />
            </div>
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--d-text-muted)', borderRight: '1px solid var(--d-border)' }}>Any week</div>
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Add guests</div>
            <Link to="/browse" className="nm-button-primary" style={{ borderRadius: '9999px', padding: '0.55rem 1rem' }}>
              <Search size={14} /> Search
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '2.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(c => (
            <Link key={c.id} to="/browse" className="nm-card" style={{ padding: '0.6rem 1rem', textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 500 }}>
              {c.label} <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{c.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section style={{ padding: '1rem 2rem 4rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem', color: 'var(--d-accent)' }}>Featured</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Hand-picked stays</h2>
          </div>
          <Link to="/browse" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.875rem' }}>
            Browse all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {featured.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Value props */}
      <section style={{ padding: '4rem 2rem', background: 'var(--d-surface-raised)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>Why Nestable</div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 600 }}>A marketplace that works for everyone</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <ValueProp icon={<ShieldCheck size={22} />} title="Verified hosts" body="Every host is identity-verified. Every listing is reviewed." />
            <ValueProp icon={<Zap size={22} />} title="Instant booking" body="Book thousands of stays in a single tap — no waiting." />
            <ValueProp icon={<HeartHandshake size={22} />} title="Fair payouts" body="Transparent fees. Hosts keep 97% of their nightly rate." />
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>Guest stories</div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Loved by travelers worldwide</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Elena P.', body: 'Every detail considered. The A-frame in Tahoe was the best stay of our year.', stay: 'Cedar A-Frame' },
              { name: 'Marcus T.', body: 'Tom is a phenomenal host. Check-in was seamless and the loft exceeded every expectation.', stay: 'Brooklyn Loft' },
              { name: 'Priya K.', body: 'Exactly what we needed — quiet, beautifully designed, and close to everything.', stay: 'Paris Studio' },
            ].map(r => (
              <div key={r.name} className="nm-card">
                <div className="nm-stars" style={{ marginBottom: '0.5rem' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>"{r.body}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>{r.name}</span>
                  <span style={{ color: 'var(--d-text-muted)' }}>{r.stay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', background: 'var(--d-surface-raised)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Ready to <span className="nm-gradient-text">find your next stay</span>?
          </h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.75rem' }}>
            Browse thousands of unique spaces, or list your own — we make both sides simple.
          </p>
          <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/browse" className="nm-button-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '0.95rem' }}>
              Start browsing <ArrowRight size={16} />
            </Link>
            <Link to="/seller" className="d-interactive" style={{ padding: '0.875rem 1.75rem', fontSize: '0.95rem', background: 'var(--d-surface)' }}>
              Become a host
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueProp({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
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
