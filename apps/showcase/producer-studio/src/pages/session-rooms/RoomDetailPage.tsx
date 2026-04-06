import { useParams, Link } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { getRoomById, SESSION_ROOMS, CHAT_MESSAGES } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

export function RoomDetailPage() {
  const { id } = useParams();
  const room = getRoomById(id ?? '') ?? SESSION_ROOMS[0];

  return (
    <SidebarMainShell navItems={NAV_ITEMS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          <Link to="/rooms" style={{ color: 'var(--d-accent)' }}>Rooms</Link>
          <span> / </span>
          <span style={{ color: 'var(--d-text)' }}>{room.name}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>{room.name}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="d-label">{room.bpm} BPM &middot; {room.key}</span>
            <span className="d-annotation" data-status={room.status === 'live' ? 'success' : room.status === 'recording' ? 'error' : 'warning'}>
              {room.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Video room layout */}
        <div
          style={{
            background: '#0a0a0f',
            borderRadius: 'var(--d-radius-lg)',
            padding: '1rem',
            minHeight: 320,
          }}
        >
          {/* Participant grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(room.participants.length || 1, 3)}, 1fr)`,
              gap: 8,
              marginBottom: '1rem',
            }}
          >
            {room.participants.length > 0 ? (
              room.participants.map((p) => (
                <div
                  key={p.name}
                  style={{
                    aspectRatio: '16/9',
                    borderRadius: 12,
                    border: p.muted ? '1px solid rgba(255,255,255,0.08)' : '2px solid var(--d-primary)',
                    boxShadow: p.muted ? 'none' : '0 0 12px rgba(34,211,238,0.3)',
                    background: '#111118',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Avatar fallback */}
                  <div
                    style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'var(--d-surface-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)',
                    }}
                  >
                    {p.avatar}
                  </div>
                  {/* Name label */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {p.name}
                    {p.muted && <span style={{ color: '#EF4444', fontSize: '0.625rem' }}>&#128263;</span>}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
                Room is empty. Be the first to join!
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              padding: '0.75rem',
              background: 'rgba(30,30,30,0.8)',
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--d-radius-full)',
              border: '1px solid rgba(255,255,255,0.1)',
              width: 'fit-content',
              margin: '0 auto',
            }}
          >
            {[
              { label: 'Mic', icon: '&#127908;', active: true },
              { label: 'Cam', icon: '&#127909;', active: true },
              { label: 'Share', icon: '&#128187;', active: false },
              { label: 'Chat', icon: '&#128172;', active: false },
            ].map((b) => (
              <button
                key={b.label}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: b.active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title={b.label}
                dangerouslySetInnerHTML={{ __html: b.icon }}
              />
            ))}
            <button
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#EF4444',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
              title="Leave"
            >
              &#9747;
            </button>
          </div>
        </div>

        {/* Chat thread */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            CHAT
          </div>
          <div className="d-surface" style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CHAT_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', marginBottom: 2 }}>
                  {msg.sender} &middot; {msg.timestamp}
                </div>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--d-radius)',
                    background: msg.isOwn ? 'color-mix(in srgb, var(--d-primary) 20%, transparent)' : 'var(--d-surface-raised)',
                    fontSize: '0.8125rem',
                    color: 'var(--d-text)',
                    maxWidth: '80%',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          {/* Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input className="d-control" placeholder="Type a message..." style={{ flex: 1 }} />
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Send</button>
          </div>
        </div>
      </div>
    </SidebarMainShell>
  );
}
