import { PageHeader } from '@/components/PageHeader';

export function PreferencesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Preferences" description="Customize your deal room experience." />

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Display</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="d-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Theme</label>
            <select className="d-control" defaultValue="dark" style={{ maxWidth: 240 }}>
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="d-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Timezone</label>
            <select className="d-control" defaultValue="est" style={{ maxWidth: 240 }}>
              <option value="est">Eastern Time (ET)</option>
              <option value="gmt">Greenwich Mean Time (GMT)</option>
              <option value="cet">Central European Time (CET)</option>
              <option value="hkt">Hong Kong Time (HKT)</option>
            </select>
          </div>
          <div>
            <label className="d-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Date Format</label>
            <select className="d-control" defaultValue="iso" style={{ maxWidth: 240 }}>
              <option value="iso">YYYY-MM-DD</option>
              <option value="us">MM/DD/YYYY</option>
              <option value="eu">DD/MM/YYYY</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Default Deal View</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['Pipeline Board', 'Table View', 'Timeline'].map(view => (
            <button
              key={view}
              className="d-interactive"
              data-variant={view === 'Pipeline Board' ? 'primary' : undefined}
              style={{ fontSize: '0.8rem' }}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Document Watermark Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
            Enable dynamic watermarks on all downloads
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
            Include viewer email in watermark text
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: 'var(--d-primary)' }} />
            Restrict print-screen capability
          </label>
        </div>
      </div>
    </div>
  );
}
