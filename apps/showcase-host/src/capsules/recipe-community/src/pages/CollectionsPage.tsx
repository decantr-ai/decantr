import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Plus } from 'lucide-react';
import { collections } from '../data/mock';

export function CollectionsPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="serif-display" style={{ fontSize: '1.875rem' }}>Collections</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            Recipe sets curated by the Gather community
          </p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <Plus size={14} /> New Collection
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {collections.map((c) => (
          <Link key={c.id} to={`/collections`} className="recipe-card food-photo-overlay"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}>
            <img src={c.cover} alt={c.title} className="food-photo" style={{ aspectRatio: '5/4' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', zIndex: 1 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', opacity: 0.85, marginBottom: '0.25rem' }}>
                {c.recipeCount} recipes · by {c.curator}
              </span>
              <h3 className="serif-display" style={{ color: '#fff', fontSize: '1.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.4)', marginBottom: '0.375rem' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#fff', opacity: 0.85, fontFamily: 'system-ui, sans-serif', lineHeight: 1.4 }}>
                {c.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
