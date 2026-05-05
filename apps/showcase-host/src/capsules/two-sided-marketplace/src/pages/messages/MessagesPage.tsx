import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { messageThreads, getListing } from '@/data/mock';

export function MessagesPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Inbox</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Messages</h1>
      </header>

      {messageThreads.length === 0 ? (
        <div className="nm-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <MessageCircle size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--d-text-muted)', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No messages yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Start a conversation by asking a host a question.</p>
        </div>
      ) : (
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
                  {listing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 'var(--d-radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={listing.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--d-primary)', fontWeight: 500 }}>{listing.title}</div>
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.lastMessage}
                  </div>
                </div>
                {t.unread > 0 && <span className="nm-badge" data-tone="accent" style={{ marginTop: '0.25rem' }}>{t.unread}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
