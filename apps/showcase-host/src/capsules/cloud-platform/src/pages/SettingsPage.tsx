import { useState } from 'react';

export function SettingsPage() {
  const [orgName, setOrgName] = useState('Acme Corp');
  const [orgSlug, setOrgSlug] = useState('acme-corp');
  const [email, setEmail] = useState('admin@acmecorp.io');
  const [timezone, setTimezone] = useState('America/New_York');
  const [notifications, setNotifications] = useState(true);
  const [deployEmails, setDeployEmails] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', maxWidth: '40rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Settings</h1>

      <form onSubmit={e => e.preventDefault()} role="form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Organization */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Organization</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Name</label>
              <input className="d-control" value={orgName} onChange={e => setOrgName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Slug</label>
              <input className="d-control" value={orgSlug} onChange={e => setOrgSlug(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Admin Email</label>
              <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Timezone</label>
              <select className="d-control" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ appearance: 'none' }}>
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Berlin">Berlin (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Email notifications', description: 'Receive email alerts for important events', value: notifications, set: setNotifications },
              { label: 'Deploy notifications', description: 'Get notified when deployments complete or fail', value: deployEmails, set: setDeployEmails },
              { label: 'Incident alerts', description: 'Receive alerts when services are degraded or down', value: incidentAlerts, set: setIncidentAlerts },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{item.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => item.set(!item.value)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 'var(--d-radius-full)',
                    background: item.value ? 'var(--d-primary)' : 'var(--d-surface-raised)',
                    border: '1px solid var(--d-border)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 250ms ease',
                    flexShrink: 0,
                  }}
                  role="switch"
                  aria-checked={item.value}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 2,
                    left: item.value ? 22 : 2,
                    transition: 'left 250ms ease',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--d-error)' }}>Danger Zone</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
            Permanently delete this organization and all associated resources. This action cannot be undone.
          </p>
          <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 1rem', fontSize: '0.8rem' }}>
            Delete Organization
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="lp-button-primary" type="submit" style={{ padding: '0.5rem 1.25rem' }}>
            Save Changes
          </button>
          <button className="d-interactive" data-variant="ghost" type="button" style={{ padding: '0.5rem 1.25rem' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
