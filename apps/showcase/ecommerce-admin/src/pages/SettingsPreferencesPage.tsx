import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsPreferencesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Theme, notifications, and workspace preferences." />
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 'var(--d-content-gap)' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Appearance</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Theme</label>
                <select className="d-control" defaultValue="dark">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Language</label>
                <select className="d-control" defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Timezone</label>
                <select className="d-control" defaultValue="pst">
                  <option value="pst">Pacific (PST)</option>
                  <option value="est">Eastern (EST)</option>
                  <option value="utc">UTC</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Currency</label>
                <select className="d-control" defaultValue="usd">
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Notifications</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'New orders', desc: 'Email when a new order is placed', checked: true },
                { label: 'Low stock', desc: 'Alert when product hits reorder threshold', checked: true },
                { label: 'Refund requests', desc: 'Notify on customer refund requests', checked: true },
                { label: 'Weekly digest', desc: 'Summary of last 7 days sales', checked: false },
              ].map((n, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid var(--d-border)' : 'none' }}>
                  <input type="checkbox" defaultChecked={n.checked} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{n.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{n.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
