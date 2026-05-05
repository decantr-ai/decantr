import { Link } from 'react-router-dom';
import { messageThreads, getListing } from '@/data/mock';

export function BuyerMessagesPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Trip messages</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Conversations with hosts</h1>
      </header>

      <div className="nm-card" style={{ padding: 0, overflow: 'hidden' }}>
        {messageThreads.map(t => {
          const listing = getListing(t.listingId);
          return (
            <Link key={t.id} to={`/messages/${t.id}`} className="nm-thread-item" style={{ alignItems: 'flex-start' }}>
              <div className="nm-avatar">{t.withAvatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.withName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{t.lastAt}</div>
                </div>
                {listing && <div style={{ fontSize: '0.72rem', color: 'var(--d-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>{listing.title}</div>}
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.lastMessage}
                </div>
              </div>
              {t.unread > 0 && <span className="nm-badge" data-tone="accent" style={{ marginTop: '0.25rem' }}>{t.unread}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
