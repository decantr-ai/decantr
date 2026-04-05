import type { ActivityEvent } from '@/data/mock';

const typeColor: Record<ActivityEvent['type'], string> = {
  lease: 'var(--d-accent)',
  payment: 'var(--d-success)',
  maintenance: 'var(--d-warning)',
  property: 'var(--d-primary)',
  tenant: 'var(--d-info)',
  system: 'var(--d-text-muted)',
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {events.map(ev => (
        <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
            background: typeColor[ev.type],
          }} />
          <div style={{ flex: 1, minWidth: 0, fontSize: '0.8rem' }}>
            <div>
              <span style={{ fontWeight: 600 }}>{ev.actor}</span>{' '}
              <span style={{ color: 'var(--d-text-muted)' }}>{ev.action}</span>{' '}
              <span>{ev.target}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{ev.timestamp}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
