import { Heart } from 'lucide-react';
import { favorites, getListing } from '@/data/mock';
import { ListingCard } from '@/components/ListingCard';
import { Link } from 'react-router-dom';

export function FavoritesPage() {
  const items = favorites.map(getListing).filter((l): l is NonNullable<typeof l> => !!l);
  return (
    <div style={{ maxWidth: 1100 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Saved</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Favorites</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem' }}>{items.length} stays you've saved for later.</p>
      </header>
      {items.length === 0 ? (
        <div className="nm-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Heart size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--d-text-muted)', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nothing saved yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Tap the heart on any listing to save it.</p>
          <Link to="/browse" className="nm-button-primary">Browse stays</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {items.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
