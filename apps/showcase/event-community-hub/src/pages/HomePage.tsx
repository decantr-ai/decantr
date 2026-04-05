import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowRight, Sparkles, Zap, Users, Calendar } from 'lucide-react';
import { events, organizers } from '../data/mock';
import { EventCard } from '../components/EventCard';

const quotes = [
  { body: 'I found my crew at Pulse. Every event feels like a house party with 500 friends you haven\'t met yet.', author: 'Luna P.', role: 'Brooklyn · 14 events attended' },
  { body: 'Best way to find the real underground shows. No ads, no algorithms — just cool people posting cool nights.', author: 'Theo V.', role: 'LA · 8 events attended' },
  { body: 'Went to Neon Bloom alone and left with six new friends. This app literally changed my year.', author: 'Sage W.', role: 'Austin · 22 events attended' },
];

const stats = [
  { label: 'Events this month', value: '1,240+', icon: Calendar },
  { label: 'Active members', value: '48k', icon: Users },
  { label: 'Cities', value: '80+', icon: Sparkles },
];

export function HomePage() {
  const featured = events.slice(0, 6);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3rem', alignItems: 'center' }} className="hero-grid">
          <div className={css('_flex _col _gap4')}>
            <span className="cat-chip" data-tone="primary" style={{ alignSelf: 'flex-start' }}>
              <Sparkles size={12} /> 1,240 events this week
            </span>
            <h1 className="display-heading" style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)' }}>
              Find your <span className="gradient-dopamine">next</span><br />
              favorite night.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: 520 }}>
              Pulse is where event people live. Discover rooftops, warehouses, festivals, and the kind of
              underground nights that become stories. Go alone. Leave with friends.
            </p>
            <div className={css('_flex _aic _gap3')}>
              <Link to="/register" className="d-interactive cta-glossy"
                style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
                Join the Party <ArrowRight size={16} />
              </Link>
              <Link to="/events" className="d-interactive" data-variant="ghost"
                style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
                Browse Events
              </Link>
            </div>
            <div className={css('_flex _aic _gap6')} style={{ marginTop: '1rem' }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="display-heading gradient-dopamine" style={{ fontSize: '1.75rem' }}>{s.value}</div>
                  <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img src={events[0].image} alt="" style={{ width: '100%', borderRadius: 'var(--d-radius-xl)', aspectRatio: '4/5', objectFit: 'cover', boxShadow: '0 30px 80px -20px rgba(255, 0, 229, 0.5)' }} />
            <div className="d-surface" data-elevation="overlay" style={{ position: 'absolute', bottom: '-1.25rem', left: '-1.25rem', padding: '1rem 1.125rem', maxWidth: 260, borderRadius: 'var(--d-radius-lg)' }}>
              <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
                <Zap size={14} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)' }} />
                <span className="display-label">Live Now</span>
              </div>
              <div className={css('_flex _aic _gap2')}>
                <img src={organizers[1].avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div>
                  <div className={css('_textsm _fontmedium')}>{organizers[1].name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>just announced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.5rem' }}>
          <div>
            <span className="display-label">This Week</span>
            <h2 className="display-heading section-title" style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>Hottest events right now</h2>
          </div>
          <Link to="/events" className={css('_textsm _fontmedium')}
            style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
            All events →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {featured.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>

      {/* Social proof */}
      <section className="d-section" style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="display-label">The Community</span>
          <h2 className="display-heading" style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>From members just like you</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {quotes.map((q) => (
            <div key={q.author} className="feature-tile" data-glow="true">
              <p className="display-heading" style={{ fontSize: '1.0625rem', lineHeight: 1.5, marginBottom: '1.125rem', fontWeight: 600 }}>
                "{q.body}"
              </p>
              <div className={css('_flex _aic _gap2')}>
                <div>
                  <div className={css('_textsm _fontmedium')}>{q.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="d-section" style={{ padding: '4rem 1.5rem 6rem' }}>
        <div className="feature-tile" data-glow="true" style={{ maxWidth: '56rem', margin: '0 auto', padding: '3.5rem 2rem', textAlign: 'center',
          borderRadius: 'var(--d-radius-xl)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 15%, var(--d-surface)), var(--d-surface))' }}>
          <Zap size={32} style={{ color: 'var(--d-primary)', fill: 'var(--d-primary)', margin: '0 auto 0.75rem' }} />
          <h2 className="display-heading" style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
            Your next unforgettable night is <span className="gradient-dopamine">one tap away</span>.
          </h2>
          <p style={{ color: 'var(--d-text-muted)', maxWidth: 520, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Join 48,000+ people who find their people through Pulse. Free to join, always.
          </p>
          <Link to="/register" className="d-interactive cta-glossy"
            style={{ textDecoration: 'none', padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
            Join Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <style>{`@media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
