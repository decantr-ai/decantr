import { SidebarMainShell } from '@/components/SidebarMainShell';
import { DATA_SOURCES, type SourceStatus } from '@/data/mock';

const NAV = [
  { label: 'All Sources', to: '/sources' },
  { label: 'Connections', to: '/connections' },
];

const STATUS_COLOR: Record<SourceStatus, string> = {
  connected: 'var(--d-primary)',
  syncing: 'var(--d-accent)',
  disconnected: 'var(--d-text-muted)',
  error: 'var(--d-error)',
};

export function ConnectionsPage() {
  return (
    <SidebarMainShell title="SOURCES" navItems={NAV}>
      <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: '0 0 1rem' }}>
        $ connections --status
      </h1>
      <div
        className="term-canvas"
        style={{ border: '1px solid var(--d-border)' }}
      >
        <table className="term-table" style={{ fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ width: '2rem' }}></th>
              <th>NAME</th>
              <th style={{ width: '6rem' }}>KIND</th>
              <th>HOST</th>
              <th style={{ width: '8rem' }}>LAST SYNC</th>
              <th style={{ width: '7rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {DATA_SOURCES.map((s) => (
              <tr key={s.id}>
                <td style={{ color: STATUS_COLOR[s.status], textAlign: 'center' }}>●</td>
                <td style={{ color: 'var(--d-text)' }}>{s.name}</td>
                <td style={{ color: 'var(--d-accent)', textTransform: 'uppercase' }}>{s.kind}</td>
                <td style={{ color: 'var(--d-text-muted)' }}>{s.host}</td>
                <td style={{ color: 'var(--d-text-muted)' }}>
                  {s.lastSync === '—' ? '—' : new Date(s.lastSync).toLocaleTimeString()}
                </td>
                <td style={{ color: STATUS_COLOR[s.status], textTransform: 'uppercase', fontWeight: 600 }}>
                  {s.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarMainShell>
  );
}
