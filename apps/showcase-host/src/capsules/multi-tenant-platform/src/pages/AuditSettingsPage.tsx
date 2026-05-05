import { PageHeader } from '@/components/PageHeader';

export function AuditSettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720 }}>
      <PageHeader
        title="Audit Settings"
        description="Configure retention, notifications, and exports"
      />

      <div className="d-surface" style={{ padding: '1.5rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Retention Policy</h3>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Retention period</span>
          <select className="d-control">
            <option>30 days</option>
            <option>60 days</option>
            <option selected>90 days (Enterprise default)</option>
            <option>180 days</option>
            <option>1 year</option>
            <option>Forever</option>
          </select>
          <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
            Events older than this will be automatically deleted.
          </span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <input type="checkbox" defaultChecked /> Archive before deletion (cold storage)
        </label>
      </div>

      <div className="d-surface" style={{ padding: '1.5rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Notifications</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'Failed authentication attempts', enabled: true },
            { label: 'API key created or revoked', enabled: true },
            { label: 'Member role changed', enabled: true },
            { label: 'Organization settings updated', enabled: false },
            { label: 'Data exports', enabled: true },
          ].map(n => (
            <label key={n.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.375rem 0', borderBottom: '1px solid var(--d-border)' }}>
              <input type="checkbox" defaultChecked={n.enabled} />
              <span style={{ flex: 1 }}>{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="d-surface" style={{ padding: '1.5rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Export</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
          Schedule automated audit log exports to your S3 bucket or SIEM.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="lp-button-primary" style={{ fontSize: '0.8rem' }}>Configure S3 export</button>
          <button className="d-interactive" style={{ fontSize: '0.8rem' }}>Configure webhook</button>
        </div>
      </div>
    </div>
  );
}
