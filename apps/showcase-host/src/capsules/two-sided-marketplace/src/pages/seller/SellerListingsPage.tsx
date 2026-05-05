import { Link } from 'react-router-dom';
import { Plus, Star, Eye, Edit3 } from 'lucide-react';
import { listings } from '@/data/mock';

export function SellerListingsPage() {
  const mine = listings.slice(0, 6);
  return (
    <div style={{ maxWidth: 1100 }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Listings</div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Your listings</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem' }}>{mine.length} active</p>
        </div>
        <button className="nm-button-primary"><Plus size={14} /> New listing</button>
      </header>

      <div className="nm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Listing</th>
              <th className="d-data-header">Price</th>
              <th className="d-data-header">Rating</th>
              <th className="d-data-header">Views</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header"></th>
            </tr>
          </thead>
          <tbody>
            {mine.map(l => (
              <tr key={l.id} className="d-data-row">
                <td className="d-data-cell">
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 'var(--d-radius-sm)', overflow: 'hidden', background: 'var(--d-surface-raised)', flexShrink: 0 }}>
                      <img src={l.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{l.location}</div>
                    </div>
                  </div>
                </td>
                <td className="d-data-cell" style={{ fontWeight: 600 }}>${l.price}</td>
                <td className="d-data-cell">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <Star size={12} fill="currentColor" style={{ color: 'var(--d-warning)' }} /> {l.rating} <span style={{ color: 'var(--d-text-muted)' }}>({l.reviews})</span>
                  </span>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>
                  <Eye size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {(l.reviews * 12.3).toFixed(0)}
                </td>
                <td className="d-data-cell">
                  <span className="nm-badge" data-tone="success">Active</span>
                </td>
                <td className="d-data-cell" style={{ textAlign: 'right' }}>
                  <Link to={`/seller/listings/${l.id}/edit`} className="d-interactive" data-variant="ghost" style={{ fontSize: '0.78rem' }}>
                    <Edit3 size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
