import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Star } from 'lucide-react';
import { getThread, getListing } from '@/data/mock';

export function ThreadPage() {
  const { id } = useParams();
  const thread = id ? getThread(id) : undefined;
  const [draft, setDraft] = useState('');
  if (!thread) {
    return (
      <div style={{ padding: '2rem' }}>
        <Link to="/messages" className="nm-button-primary">Back to inbox</Link>
      </div>
    );
  }
  const listing = getListing(thread.listingId);
  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--d-border)', marginBottom: '0.5rem' }}>
        <Link to="/messages" className="d-interactive" data-variant="ghost" style={{ padding: '0.4rem', border: 'none' }}><ArrowLeft size={16} /></Link>
        <div className="nm-avatar">{thread.withAvatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{thread.withName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', textTransform: 'capitalize' }}>Your {thread.withRole}</div>
        </div>
      </header>

      {/* Contextual listing card */}
      {listing && (
        <Link to={`/listings/${listing.id}`} className="nm-card" style={{ padding: '0.625rem', display: 'flex', gap: '0.75rem', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginBottom: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--d-radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
            <img src={listing.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{listing.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {listing.location} · <Star size={10} fill="currentColor" style={{ color: 'var(--d-warning)' }} /> {listing.rating}
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>${listing.price}<span style={{ fontWeight: 400, fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>/{listing.priceUnit}</span></div>
        </Link>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '0.5rem 0' }}>
        {thread.messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
            <div className="nm-bubble" data-me={m.from === 'me' ? 'true' : undefined}>{m.body}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{m.at}</div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={e => { e.preventDefault(); setDraft(''); }}
        style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)' }}
      >
        <input
          className="nm-input"
          placeholder="Type a message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="nm-button-primary" disabled={!draft.trim()} style={{ padding: '0.55rem 0.9rem' }}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
