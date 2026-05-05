import { useState } from 'react';
import { css } from '@decantr/css';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { events } from '../data/mock';
import { EventCard } from '../components/EventCard';

const categories = ['All', 'Music Festival', 'Rooftop Party', 'Club Night', 'Art Experience', 'Community', 'Market', 'Afterhours'];

export function EventsPage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [view, setView] = useState<'grid' | 'calendar' | 'map'>('grid');

  const filtered = events.filter((e) =>
    (cat === 'All' || e.category === cat) &&
    (e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase()) || e.city.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className={css('_flex _col _gap4')} style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <header className={css('_flex _col _gap2')}>
        <span className="display-label">Discover</span>
        <h1 className="display-heading section-title" style={{ fontSize: '2.25rem' }}>
          Upcoming events near you
        </h1>
        <p style={{ color: 'var(--d-text-muted)' }}>
          {filtered.length} events · sorted by happening soon
        </p>
      </header>

      {/* Search + filters */}
      <div className="feature-tile">
        <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 240, background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', padding: '0 0.75rem' }}>
            <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events, venues, cities..."
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.625rem 0', outline: 'none', color: 'var(--d-text)' }}
            />
          </div>
          <div className={css('_flex _aic _gap1')}>
            <button onClick={() => setView('grid')} className="d-interactive" data-variant={view === 'grid' ? 'primary' : 'ghost'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
              <Filter size={14} /> Grid
            </button>
            <button onClick={() => setView('calendar')} className="d-interactive" data-variant={view === 'calendar' ? 'primary' : 'ghost'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
              <Calendar size={14} /> Calendar
            </button>
            <button onClick={() => setView('map')} className="d-interactive" data-variant={view === 'map' ? 'primary' : 'ghost'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
              <MapPin size={14} /> Map
            </button>
          </div>
        </div>
        <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="cat-chip"
              data-tone={cat === c ? 'primary' : 'soft'}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}

      {view === 'calendar' && (
        <div className="feature-tile">
          <h3 className="display-heading" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>April — May 2026</h3>
          <div className={css('_flex _col _gap2')}>
            {filtered.map((e) => {
              const d = new Date(e.date);
              return (
                <a key={e.id} href={`#/events/${e.id}`}
                  className={css('_flex _aic _gap4')}
                  style={{ padding: '0.875rem', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)', textDecoration: 'none', color: 'inherit', background: 'var(--d-surface)' }}>
                  <div style={{ minWidth: 60, textAlign: 'center' }}>
                    <div className="display-heading gradient-pink-violet" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{d.getUTCDate()}</div>
                    <div className="display-label" style={{ fontSize: '0.6875rem' }}>{['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getUTCMonth()]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={css('_fontmedium')} style={{ marginBottom: '0.25rem' }}>{e.title}</div>
                    <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{e.venue} · {e.city}</div>
                  </div>
                  <span className="cat-chip" data-tone="soft">{e.category}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {view === 'map' && (
        <div className="feature-tile" style={{ height: 500, position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(circle at 30% 40%, rgba(255, 0, 229, 0.2), transparent 40%), radial-gradient(circle at 70% 60%, rgba(0, 255, 136, 0.15), transparent 40%), var(--d-surface)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
            <MapPin size={40} style={{ color: 'var(--d-primary)' }} />
            <div className="display-heading" style={{ fontSize: '1.25rem' }}>Map View</div>
            <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{filtered.length} events pinned worldwide</div>
          </div>
          {filtered.slice(0, 5).map((e, i) => (
            <div key={e.id} style={{ position: 'absolute',
              top: `${20 + i * 14}%`, left: `${15 + i * 16}%`,
              background: 'var(--d-bg)', border: '2px solid var(--d-primary)',
              padding: '0.375rem 0.625rem', borderRadius: 'var(--d-radius)',
              fontSize: '0.75rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(255, 0, 229, 0.4)' }}>
              {e.city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
