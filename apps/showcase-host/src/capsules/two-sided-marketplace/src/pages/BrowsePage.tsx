import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Map as MapIcon, LayoutGrid, Star } from 'lucide-react';
import { listings, categories } from '@/data/mock';
import { ListingCard } from '@/components/ListingCard';

export function BrowsePage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [priceMax, setPriceMax] = useState(700);
  const [instantOnly, setInstantOnly] = useState(false);
  const [activePin, setActivePin] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (cat !== 'all' && l.category !== cat) return false;
      if (l.price > priceMax) return false;
      if (instantOnly && !l.instantBook) return false;
      if (query && !l.title.toLowerCase().includes(query.toLowerCase()) && !l.location.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [cat, priceMax, instantOnly, query]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem 2rem 3rem' }}>
      {/* Search + filters bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="nm-input"
            placeholder="Search by place or title"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--d-surface-raised)', padding: '0.25rem', borderRadius: 'var(--d-radius)' }}>
          <button
            className="d-interactive"
            data-variant={view === 'grid' ? 'primary' : 'ghost'}
            onClick={() => setView('grid')}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', border: view === 'grid' ? undefined : 'none' }}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            className="d-interactive"
            data-variant={view === 'map' ? 'primary' : 'ghost'}
            onClick={() => setView('map')}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', border: view === 'map' ? undefined : 'none' }}
          >
            <MapIcon size={14} /> Map
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="d-interactive"
            data-variant={cat === c.id ? 'primary' : 'ghost'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', whiteSpace: 'nowrap', border: cat === c.id ? undefined : '1px solid var(--d-border)' }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: '1.5rem' }}>
        {/* Filters sidebar */}
        <aside className="nm-card" style={{ alignSelf: 'start', position: 'sticky', top: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
            <SlidersHorizontal size={15} /> Filters
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div className="d-label" style={{ marginBottom: '0.5rem' }}>Price / night</div>
              <input type="range" min={50} max={700} step={10} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                <span>$50</span>
                <span style={{ color: 'var(--d-text)', fontWeight: 600 }}>Up to ${priceMax}</span>
                <span>$700+</span>
              </div>
            </div>
            <div>
              <div className="d-label" style={{ marginBottom: '0.5rem' }}>Booking</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={instantOnly} onChange={e => setInstantOnly(e.target.checked)} /> Instant book only
              </label>
            </div>
            <div>
              <div className="d-label" style={{ marginBottom: '0.5rem' }}>Rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                <Star size={14} fill="currentColor" style={{ color: 'var(--d-warning)' }} /> 4.8+
              </div>
            </div>
            <button className="d-interactive" onClick={() => { setCat('all'); setPriceMax(700); setInstantOnly(false); setQuery(''); }} style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
              Clear all
            </button>
          </div>
        </aside>

        {/* Content */}
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '0.875rem' }}>
            {filtered.length} stay{filtered.length === 1 ? '' : 's'}
          </div>

          {view === 'grid' ? (
            filtered.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem', minHeight: 600 }}>
              <div className="nm-map" style={{ minHeight: 600 }}>
                {filtered.map(l => (
                  <button
                    key={l.id}
                    className="nm-map-pin"
                    data-active={activePin === l.id ? 'true' : undefined}
                    style={{ left: `${l.mapX}%`, top: `${l.mapY}%` }}
                    onClick={() => setActivePin(l.id)}
                  >
                    ${l.price}
                  </button>
                ))}
              </div>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 600 }}>
                {filtered.map(l => (
                  <Link
                    key={l.id}
                    to={`/listings/${l.id}`}
                    className="nm-card"
                    style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', textDecoration: 'none', color: 'inherit', borderColor: activePin === l.id ? 'var(--d-primary)' : undefined }}
                    onMouseEnter={() => setActivePin(l.id)}
                  >
                    <div style={{ width: 88, aspectRatio: '4/3', borderRadius: 'var(--d-radius)', overflow: 'hidden', flexShrink: 0, background: 'var(--d-surface-raised)' }}>
                      <img src={l.image} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.25rem 0' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{l.location}</div>
                      <div style={{ fontSize: '0.78rem', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Star size={10} fill="currentColor" style={{ color: 'var(--d-warning)' }} /> {l.rating}
                        <span style={{ marginLeft: 'auto', fontWeight: 700 }}>${l.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--d-text-muted)' }}>
      <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--d-text)', marginBottom: '0.35rem' }}>No stays match your filters</h3>
      <p style={{ fontSize: '0.875rem' }}>Try widening your price range or clearing the category.</p>
    </div>
  );
}
