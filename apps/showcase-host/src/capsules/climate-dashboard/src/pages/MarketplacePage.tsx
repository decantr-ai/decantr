import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Search, Filter, Star, ShoppingCart, Leaf } from 'lucide-react';
import { offsetProjects } from '@/data/mock';
import type { CartItem } from '@/data/mock';

const types = ['All', 'REDD+', 'Renewable Energy', 'Energy Efficiency', 'Afforestation', 'Blue Carbon', 'Carbon Removal'];

export function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = offsetProjects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'All' && p.type !== typeFilter) return false;
    return true;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const proj = offsetProjects.find(p => p.id === item.projectId);
    return sum + (proj ? proj.price * item.quantity : 0);
  }, 0);

  const cartCredits = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(projectId: string) {
    setCart(prev => {
      const existing = prev.find(c => c.projectId === projectId);
      if (existing) {
        return prev.map(c => c.projectId === projectId ? { ...c, quantity: c.quantity + 100 } : c);
      }
      return [...prev, { projectId, quantity: 100 }];
    });
  }

  return (
    <div className={css('_flex _col _gap6')}>
      <div className={css('_flex _jcsb _aic _wrap _gap3')}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Offset Marketplace</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Browse and purchase verified carbon credits</p>
        </div>
        {cart.length > 0 && (
          <Link to="/offsets/checkout" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
            <ShoppingCart size={16} />
            {cartCredits.toLocaleString()} credits &middot; ${cartTotal.toLocaleString()}
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div className={css('_flex _gap3 _aic _wrap')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input className="d-control earth-input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={css('_flex _aic _gap2 _wrap')}>
          <Filter size={14} style={{ color: 'var(--d-text-muted)' }} />
          {types.map(t => (
            <button
              key={t}
              className="d-interactive"
              data-variant={typeFilter === t ? 'primary' : 'ghost'}
              onClick={() => setTypeFilter(t)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      <div className={css('_grid _gc1 sm:_gc2 lg:_gc3 _gap4')}>
        {filtered.map((p, i) => (
          <div key={p.id} className="d-surface earth-card entrance-fade" style={{ animationDelay: `${i * 60}ms`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 120, background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 20%, transparent), color-mix(in srgb, var(--d-accent) 20%, transparent))', borderRadius: 'var(--d-radius-sm)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={32} style={{ color: 'var(--d-primary)', opacity: 0.6 }} />
            </div>
            <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.375rem' }}>
              <span className="earth-badge" style={{ fontSize: '0.6875rem', background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)', color: 'var(--d-accent)', padding: '0.125rem 0.5rem', borderRadius: 'var(--d-radius-full)' }}>
                {p.type}
              </span>
              <div className={css('_flex _aic _gap1')} style={{ fontSize: '0.75rem', color: 'var(--d-warning)' }}>
                <Star size={12} fill="currentColor" /> {p.rating}
              </div>
            </div>
            <Link to={`/offsets/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{p.name}</h3>
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5, flex: 1 }}>{p.description}</p>
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem' }}>
              <div className={css('_flex _jcsb _aic')}>
                <div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${p.price}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>/tCO2e</span>
                </div>
                <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={() => addToCart(p.id)}>
                  Add 100t
                </button>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>
                {p.available.toLocaleString()} tCO2e available &middot; {p.standard} &middot; {p.vintage}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="d-surface earth-card" style={{ position: 'sticky', bottom: '1rem' }}>
          <div className={css('_flex _jcsb _aic')}>
            <div className={css('_flex _aic _gap3')}>
              <ShoppingCart size={18} style={{ color: 'var(--d-primary)' }} />
              <span style={{ fontWeight: 600 }}>{cart.length} project{cart.length > 1 ? 's' : ''} &middot; {cartCredits.toLocaleString()} credits</span>
            </div>
            <div className={css('_flex _aic _gap3')}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${cartTotal.toLocaleString()}</span>
              <Link to="/offsets/checkout" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
