import { Link } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { SESSION_ROOMS, ACTIVITY_FEED } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

const STATUS_MAP: Record<string, { color: string; status: string }> = {
  live: { color: 'success', status: 'LIVE' },
  recording: { color: 'error', status: 'REC' },
  idle: { color: 'warning', status: 'IDLE' },
  closed: { color: undefined as unknown as string, status: 'CLOSED' },
};

export function RoomsPage() {
  return (
    <SidebarMainShell navItems={NAV_ITEMS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Session Rooms</h1>
          <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            + Create Room
          </button>
        </div>

        {/* Room cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {SESSION_ROOMS.map((room) => {
            const st = STATUS_MAP[room.status];
            return (
              <Link
                key={room.id}
                to={`/rooms/${room.id}`}
                className="d-surface"
                data-interactive
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)' }}>{room.name}</span>
                  <span className="d-annotation" data-status={st.color}>
                    {room.status === 'live' && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--d-success)', marginRight: 4, animation: 'decantr-pulse 1.5s ease-in-out infinite' }} />}
                    {st.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>
                  Host: {room.host} &middot; {room.bpm} BPM &middot; {room.key}
                </div>
                {/* Participant avatars */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {room.participants.length > 0 ? (
                    room.participants.map((p) => (
                      <div
                        key={p.name}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--d-surface-raised)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.5625rem', fontWeight: 700, color: p.muted ? 'var(--d-text-muted)' : 'var(--d-primary)',
                          border: p.muted ? '1px solid var(--d-border)' : '1px solid var(--d-primary)',
                        }}
                        title={`${p.name}${p.muted ? ' (muted)' : ''}`}
                      >
                        {p.avatar}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>No participants</span>
                  )}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                  {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Activity feed */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            RECENT ACTIVITY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY_FEED.map((item) => (
              <div key={item.id} className="d-data-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.625rem 0' }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--d-primary)',
                    flexShrink: 0,
                  }}
                >
                  {item.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text)' }}>
                    <span style={{ fontWeight: 500 }}>{item.user}</span>{' '}
                    <span style={{ color: 'var(--d-text-muted)' }}>{item.action}</span>
                  </div>
                </div>
                <span className="d-label" style={{ fontSize: '0.5625rem', whiteSpace: 'nowrap' }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarMainShell>
  );
}
