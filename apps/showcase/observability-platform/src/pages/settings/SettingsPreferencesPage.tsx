import { SettingsNav } from '@/components/SettingsNav';

const prefs = [
  { label: 'Theme', options: ['Dark', 'Light', 'System'], current: 'Dark' },
  { label: 'Default time range', options: ['1h', '6h', '24h', '7d'], current: '6h' },
  { label: 'Default metrics page', options: ['Overview', 'Services', 'SLOs'], current: 'Overview' },
  { label: 'Timezone', options: ['UTC', 'America/Los_Angeles', 'Europe/London'], current: 'America/Los_Angeles' },
  { label: 'Language', options: ['English', 'Deutsch', 'Français'], current: 'English' },
];

const notifications = [
  { label: 'Critical alerts', channels: ['Email', 'Slack', 'PagerDuty'] },
  { label: 'High alerts', channels: ['Email', 'Slack'] },
  { label: 'Incident updates', channels: ['Email', 'Slack'] },
  { label: 'Weekly reports', channels: ['Email'] },
];

export function SettingsPreferencesPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Settings</h1>
      <SettingsNav />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Workspace Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prefs.map(p => (
              <div key={p.label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 10 }}>
                <div className="fin-label">{p.label}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {p.options.map(o => (
                    <button key={o} className="fin-badge" style={{
                      cursor: 'pointer',
                      borderColor: p.current === o ? 'var(--d-primary)' : undefined,
                      color: p.current === o ? 'var(--d-primary)' : undefined,
                    }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fin-card">
          <div className="fin-label" style={{ marginBottom: 10 }}>Notifications</div>
          <table className="fin-table">
            <thead><tr><th>Event</th><th>Delivery Channels</th></tr></thead>
            <tbody>
              {notifications.map(n => (
                <tr key={n.label}>
                  <td style={{ fontWeight: 500 }}>{n.label}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {n.channels.map(c => <span key={c} className="fin-badge" data-severity="info">{c}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
