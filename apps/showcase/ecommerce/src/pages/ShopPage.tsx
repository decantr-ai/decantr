import { useState } from 'react';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { products, categories } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';

export function ShopPage() {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = products
    .filter(p => category === 'all' || p.category === category)
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>Shop</div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>All products</h1>
        <p style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          {filtered.length} items · Shipping globally
        </p>
      </header>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Filters sidebar */}
        <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <SlidersHorizontal size={13} /> Filters
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className="d-interactive"
                data-variant="ghost"
                data-active={category === c.id ? 'true' : undefined}
                style={{
                  justifyContent: 'space-between',
                  border: 'none',
                  fontSize: '0.875rem',
                  padding: '0.5rem 0.75rem',
                  background: category === c.id ? 'color-mix(in srgb, var(--d-primary) 10%, transparent)' : 'transparent',
                  color: category === c.id ? 'var(--d-primary)' : 'var(--d-text)',
                  fontWeight: category === c.id ? 600 : 400,
                }}
              >
                <span>{c.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.count}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Price</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="ec-input" placeholder="$ Min" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} />
              <input className="ec-input" placeholder="$ Max" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <select value={sort} onChange={e => setSort(e.target.value)} className="ec-input" style={{ width: 'auto', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}>
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => setView('grid')}
                aria-label="Grid view"
                style={{ padding: '0.5rem', border: view === 'grid' ? '1px solid var(--d-border-strong)' : '1px solid transparent' }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => setView('list')}
                aria-label="List view"
                style={{ padding: '0.5rem', border: view === 'list' ? '1px solid var(--d-border-strong)' : '1px solid transparent' }}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
            gap: '1.25rem',
          }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="d-interactive" style={{ padding: '0.75rem 2rem', background: 'var(--d-surface)' }}>
              Load more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
